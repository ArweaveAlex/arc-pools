import * as async from 'async';

import minimist from "minimist";
import { Relay, relayInit} from 'nostr-tools';
import 'websocket-polyfill';

import { PoolClient } from "../../../clients/pool";
import { IPoolClient, PoolConfigType } from "../../../helpers/types";
import { exitProcess, log } from "../../../helpers/utils";

import { genKeys, processEvent } from ".";
import { RELAY_OVERHEAD_LIMIT, RELAY_QUEUE_PROC_SIZE } from "../../../helpers/config";


export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  log("Mining nostr", 0);

  await genKeys(poolClient, argv._[1]);

  await listenOnRelays(poolClient, argv);
}

// Initialize all the configured relays 
// before proceeding with any processing
async function listenOnRelays(poolClient: IPoolClient, _argv: minimist.ParsedArgs) {
  let relaysInitialized = 0;
  let relayCount = 0;
  let relays = poolClient.poolConfig.nostr.relays.map((r: any) => {return r.socket});
  relayCount = relays.length;
  for(let i=0; i < relays.length; i++) {
    const relay = relayInit(relays[i]);
    relay.connect().then(async () => {
      relay.on('connect', () => {
        console.log(`connected to ${relay.url}`);
        relaysInitialized = relaysInitialized + 1;
      });
    
      relay.on('error', () => {
        console.log(`failed to connect to ${relay.url}`)
      });
    
      // wait for all relays to initialize
      while(relaysInitialized < relayCount){
        await new Promise(r => setTimeout(r, 1000));
      }

      handleRelayProcess(poolClient, relay);
    }).catch((e: any) => {
      relayCount = relayCount-1;
      console.log(e);
    });
  }
}


async function handleRelayProcess(poolClient: IPoolClient, relay: any){
  const incomingPosts: any[] = [];
  let isOverheadLimitReached = false;
  let profiles = {};

  // create a queue where we will push in a chunk list
  // of post events and wait until they are processed to proceed
  const processIncomingPosts = async.queue(async (task: any, cb: any) => {

    for(let i=0; i< task.postEvents.length; i++){
      let profile = profiles[task.postEvents[i].pubkey];
      profile = profile ? profile : {pubkey: task.postEvents[i].pubkey};
  
      let finalEvent = {
        post: task.postEvents[i],
        profile: profile
      }
  
      let includes = false;
  
      let keywords = poolClient.poolConfig.keywords;
      let str = JSON.stringify(finalEvent);
  
      let result = keywords.some(function(keyword) {
        return str.toLowerCase().includes(keyword.toLowerCase());
      });
      
      if(result) {
        processEvent(
          poolClient, 
          {
            event: finalEvent, 
            contentModeration: false
          }
        );
      }

    }

    cb();
  }, 10);

  let count = 0;
  let sub = relay.sub([{kinds: [0, 1]}]);
  
  sub.on('event', async (event: any) => {
    // So I think it sends us all the profile information first
    if(event.kind == 0) {
      profiles[event.pubkey] = event.content;
    } else {
      count = count + 1;
    
      incomingPosts.push(event);

      if(count >= RELAY_OVERHEAD_LIMIT) {
        console.log("Overhead limit reached");
        sub.unsub();
        isOverheadLimitReached = true;
      } else {
        incomingPosts.push(event);
      }
    }
    
  });

  async.setImmediate(async () => {
    while (incomingPosts.length > 0 || !isOverheadLimitReached) {
      if (incomingPosts.length >= RELAY_QUEUE_PROC_SIZE) {
        const chunk = incomingPosts.splice(0, RELAY_QUEUE_PROC_SIZE);
        processIncomingPosts.push({postEvents: chunk});
      } else {
        // All posts have been processed or less than RELAY_QUEUE_PROC_SIZE posts have been added
        // wait and then continue polling in the loop
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // start over once the overhead limit is
    // reached so we don't run out of memory
    await new Promise(resolve => setTimeout(resolve, 5000));
    await handleRelayProcess(poolClient, relay);
  });
};

async function handleRelay(poolClient: IPoolClient, relay: any) {
  await handleRelayProcess(poolClient, relay);
};