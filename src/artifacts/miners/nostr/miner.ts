import minimist from "minimist";
import { relayInit} from 'nostr-tools';
import 'websocket-polyfill';

import { PoolClient } from "../../../clients/pool";
import { IPoolClient, PoolConfigType } from "../../../helpers/types";
import { exitProcess, log } from "../../../helpers/utils";

import { genKeys, processEvent } from ".";


export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  log("Mining nostr", 0);

  await genKeys(poolClient, argv._[1]);

  await listenOnRelays(poolClient, argv);
}

async function listenOnRelays(poolClient: IPoolClient, _argv: minimist.ParsedArgs) {
  let relays = poolClient.poolConfig.nostr.relays.map((r: any) => {return r.socket});
  for(let i=0; i < relays.length; i++) {
    const relay = relayInit(relays[i]);
    relay.connect().then(() => {
      relay.on('connect', () => {
        console.log(`connected to ${relay.url}`)
      });
    
      relay.on('error', () => {
        console.log(`failed to connect to ${relay.url}`)
      });
    
      let sub = relay.sub([
        {
          kinds: [0, 1]
        }
      ]);
      
      sub.on('event', async (metadataEvent: any) => {
        if(metadataEvent.kind == 0) {
          console.log("profile event")
          console.log(metadataEvent)
        }
        if(metadataEvent.kind == 1) {
          console.log("post event")
          console.log(metadataEvent)
        }
        // let sub2 = relay.sub([
        //   {
        //     ids: [metadataEvent.id]
        //   }
        // ]);
        // sub2.on('event', (event2: any) => {
        //   console.log('we got the event we wanted:', event2);
        //   // for (const substring of poolClient.poolConfig.keywords) {
        //   //   if (metadataEvent.content.toLowerCase().includes(substring.toLowerCase())) {
        //   //     break;
        //   //   }
        //   // }
        // })
        // sub2.on('eose', () => {
        //   sub2.unsub()
        // })
        
      });
    }).catch((e: any) => {
      console.log(e);
    });
  }
}