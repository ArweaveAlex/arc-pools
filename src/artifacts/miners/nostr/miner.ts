import * as async from 'async';

import minimist from "minimist";
import { relayInit} from 'nostr-tools';
import 'websocket-polyfill';
import { throttle } from 'lodash';

import { PoolClient } from "../../../clients/pool";
import { IPoolClient, PoolConfigType } from "../../../helpers/types";
import { exitProcess, log } from "../../../helpers/utils";

import { genKeys, processThread } from ".";
import { Nostr } from "./Nostr"
// import { RELAY_OVERHEAD_LIMIT, RELAY_QUEUE_PROC_SIZE } from "../../../helpers/config";

// let countGlobal = 0;
// let lastCount = 0;
// let countDiff = 0;

// setInterval(function() {
//   // console.log(countGlobal);
//   countDiff = countGlobal - lastCount;
//   console.log(countDiff);
//   lastCount = countGlobal;
// }, 1000);

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  log("Mining nostr", 0);

  await genKeys(poolClient, argv._[1]);

  await mineGlobalMessages(poolClient);

}

export async function mineGlobalMessages(poolClient: IPoolClient) {
  let nostr = Nostr;
  let globalMessages = new Set<string>();
  nostr.init();
  await new Promise(r => setTimeout(r, 5000));

  nostr.getMessagesByEveryone((messages: string[]) => {
    // add new messages to the set
    messages.forEach(message => globalMessages.add(message));
  });

  let i = 0;
  while (true) {
    console.log(Array.from(globalMessages));

    let eventId = globalMessages[i];
    nostr.getRepliesAndLikes(eventId, (replies, likedBy, threadReplyCount) => {
      let event = nostr.eventsById.get(eventId);
      const sortedReplies =
        replies &&
        Array.from(replies).sort((a, b) => {
          const eventA = Nostr.eventsById.get(a);
          const eventB = Nostr.eventsById.get(b);
          // show replies by original post's author first
          if (eventA?.pubkey === event?.pubkey && eventB?.pubkey !== event?.pubkey) {
            return -1;
          } else if (
            eventA?.pubkey !== event?.pubkey &&
            eventB?.pubkey === event?.pubkey
          ) {
            return 1;
          }
          return eventA?.created_at - eventB?.created_at;
        });
      console.log(threadReplyCount);
      console.log(sortedReplies);
    });


    await new Promise(r => setTimeout(r, 5000));
  }
}

// const updateSortedMessages = throttle(
//   (sortedMessages: any) => {
//     // console.log(sortedMessages);
//   },
//   3000,
//   { leading: true },
// );

// Initialize all the configured relays 
// before proceeding with any processing
// async function listenOnRelays(poolClient: IPoolClient, _argv: minimist.ParsedArgs) {
//   let relaysInitialized = 0;
//   let relayCount = 0;
//   let relays = poolClient.poolConfig.nostr.relays.map((r: any) => {return r.socket});
//   relayCount = relays.length;
//   for(let i=0; i < relays.length; i++) {
//     const relay = relayInit(relays[i]);
//     relay.connect().then(async () => {
//       relay.on('connect', () => {
//         console.log(`connected to ${relay.url}`);
//         relaysInitialized = relaysInitialized + 1;
//       });
    
//       relay.on('error', () => {
//         console.log(`failed to connect to ${relay.url}`)
//       });
    
//       // wait for all relays to initialize
//       while(relaysInitialized < relayCount){
//         await new Promise(r => setTimeout(r, 1000));
//       }

//       handleRelay(poolClient, relay);
//     }).catch((e: any) => {
//       relayCount = relayCount-1;
//       console.log(e);
//     });
//   }
// }


// async function handleRelayProcess(poolClient: IPoolClient, relay: any){
//   const incomingPosts: any[] = [];
//   let isOverheadLimitReached = false;
//   let profiles = {};

//   // create a queue where we will push in a chunk list
//   // of post events and wait until they are processed to proceed
//   const processIncomingPosts = async.queue(async (task: any, cb: any) => {

//     for(let i=0; i< task.postEvents.length; i++){
//       console.log(task.postEvents[i])
//       let profile = profiles[task.postEvents[i].pubkey];
//       profile = profile ? JSON.parse(profile) : {pubkey: task.postEvents[i].pubkey};
//       //console.log(task.postEvents[i].tags)
//       let finalEvent = {
//         post: task.postEvents[i],
//         profile: profile
//       }
  
//       let keywords = poolClient.poolConfig.keywords;
//       let str = JSON.stringify(finalEvent);
  
//       let result = keywords.some(function(keyword) {
//         return str.toLowerCase().includes(keyword.toLowerCase());
//       });

      
//       // if(result) {
//       //   // if it is a reply
//       //     // build thread from that reply using getRepliesandLikes from Nostr
//       //     // check existence of top level post ignore if it is already there
//       //   //
//       //   processThread(
//       //     poolClient, 
//       //     {
//       //       event: finalEvent, 
//       //       contentModeration: false
//       //     }
//       //   );
//       // }

//     }

//     cb();
//   }, 10);

//   let count = 0;
//   let sub = relay.sub([{kinds: [
//     // metadata
//     //0, 
//     // posts
//     1, 
//     // reactions
//     //7
//   ]}]);

//   // let sub = relay.sub([{ids: [
//   //   "d15a51b69e2b8e19bdea6f2586962a8d5d7c502f3196796a46bcdac8f204a363"
//   // ]}]);
  
//   sub.on('event', async (event: any) => {
//     if(event.kind == 0) {
//       profiles[event.pubkey] = event.content;
//     } else {
//       count = count + 1;
    
//       incomingPosts.push(event);

//       if(count >= RELAY_OVERHEAD_LIMIT) {
//         console.log("Overhead limit reached");
//         sub.unsub();
//         isOverheadLimitReached = true;
//       } else {
//         incomingPosts.push(event);
//       }
//     }
    
//   });

//   async.setImmediate(async () => {
//     while (incomingPosts.length > 0 || !isOverheadLimitReached) {
//       if (incomingPosts.length >= RELAY_QUEUE_PROC_SIZE) {
//         const chunk = incomingPosts.splice(0, RELAY_QUEUE_PROC_SIZE);
//         processIncomingPosts.push({postEvents: chunk});
//       } else {
//         // All posts have been processed or less than RELAY_QUEUE_PROC_SIZE posts have been added
//         // wait and then continue polling in the loop
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//     }

//     // start over once the overhead limit is
//     // reached so we don't run out of memory
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     await handleRelay(poolClient, relay);
//   });
// };

// // so the recursion doesn't create stack overflow
// async function handleRelay(poolClient: IPoolClient, relay: any) {
//   await handleRelayProcess(poolClient, relay);
// };