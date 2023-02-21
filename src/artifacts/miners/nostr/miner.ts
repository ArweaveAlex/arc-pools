import * as async from 'async';

import minimist from "minimist";
import { relayInit} from 'nostr-tools';
import 'websocket-polyfill';
import { throttle } from 'lodash';

import { PoolClient } from "../../../clients/pool";
import { IPoolClient, PoolConfigType } from "../../../helpers/types";
import { exitProcess, log } from "../../../helpers/utils";

import { genKeys, processEvent } from ".";
import { Nostr } from "./Nostr"

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
    messages.forEach(message => globalMessages.add(message));
  });



  while (true) {
    const eventId = globalMessages.values().next().value;
    let event = nostr.eventsById.get(eventId);
    globalMessages.delete(eventId);

    // getRepliesAndLikes does't return a Promise. It calls the callback
    // an unkown number of times for an unknown number of replies etc...
    // we still want to process sync here so we wait for a certain amount 
    // of time compiling replies and then proceed. This wrapping is done
    // to make the async call to nostr.getRepliesAndLikes into sync for now
    let [replies, likedBy, threadReplyCount]: [Set<String>, Set<String>, number] = await new Promise((resolve, reject) => {
      let allReplies: Set<String> = new Set();
      let allLikedBy: Set<String> = new Set();
      let allThreadReplyCount: number;
      let timeoutId: NodeJS.Timeout;
    
      const callback = (repliesI: Set<string>, likedByI: Set<string>, threadReplyCountI: number) => {
        repliesI.forEach(r => allReplies.add(r));
        likedByI.forEach(l => allLikedBy.add(l));
        allThreadReplyCount = threadReplyCountI;
    
        // Reset the timeout each time a callback is received
        // if nothing has been received in 2 seconds resolve the promise
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve([allReplies, allLikedBy, allThreadReplyCount]);
        }, 2000);
      };
    
      nostr.getRepliesAndLikes(eventId, callback);
    
      // Set the initial timeout, if no callbacks in this time, resolve
      timeoutId = setTimeout(() => {
        resolve([allReplies, allLikedBy, allThreadReplyCount]);
      }, 4000);
    });

    const sortedReplies =
      replies &&
      Array.from(replies).sort((a: string, b: string) => {
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


    // console.log(event);
    // console.log(replies);
    // console.log(likedBy);
    // console.log(threadReplyCount);
    // console.log(sortedReplies);
    
    // subscribe to the profile event and wait until we get it back
    let profile = await new Promise((resolve, _reject) => {
      const callback = () => {
        console.log()
        resolve(nostr.profileEventByUser.get(event.pubkey));
      };
      console.log("lookin for prof")
      nostr.getProfile(event.pubkey, callback);
      setTimeout(() => {
        console.log("could not find prof")
        resolve(event.pubkey);
      }, 4000);
    });

    let eventWithProfile = {
      post: event,
      profile: profile
    };

    console.log(eventWithProfile)

    // await processEvent(
    //   poolClient, 
    //   {
    //     event: eventWithProfile, 
    //     associationId: event.id, 
    //     associationSequence: "0", 
    //     contentModeration: false
    //   }
    // );

    // for(let i=0; i<sortedReplies.length; i++) {
    //   let id = sortedReplies[i].toString();
    //   let orderedEvent = nostr.eventsById.get(id);

    //   // subscribe to the profile event and wait until we get it back
    //   let profileForOrderedEvent = await new Promise((resolve, _reject) => {
    //     const callback = () => {
    //       console.log()
    //       resolve(nostr.profileEventByUser.get(event.pubkey));
    //     };
      
    //     nostr.getProfile(event.pubkey, callback);
    //   });

    //   let orderedEventWithProfile = {
    //     post: event,
    //     profile: profileForOrderedEvent
    //   };

    //   await processEvent(
    //     poolClient, 
    //     {
    //       event: orderedEventWithProfile, 
    //       associationId: orderedEvent.id, 
    //       associationSequence: (i + 1).toString(), 
    //       contentModeration: false
    //     }
    //   );
    // }

  }
}