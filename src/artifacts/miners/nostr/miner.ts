import * as async from 'async';

import minimist from "minimist";
import 'websocket-polyfill';
import { throttle } from 'lodash';

import { PoolClient } from "../../../clients/pool";
import { IPoolClient, PoolConfigType } from "../../../helpers/types";
import { exitProcess, log } from "../../../helpers/utils";

import { processEvent } from ".";
import { Nostr } from "./Nostr"

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  log("Mining nostr", 0);

  // await genKeys(poolClient, argv._[1]);

  await mineGlobalMessages(poolClient);

}

export async function mineGlobalMessages(poolClient: IPoolClient) {
  let nostr = Nostr;
  let globalMessages = new Set<string>();
  nostr.init();

  await new Promise(r => setTimeout(r, 5000));

  nostr.getMessagesByEveryone((messages: string[]) => {
    messages.forEach(message => {if(message) globalMessages.add(message)});
  });

  while (true) {
    const eventId = globalMessages.values().next().value;
    if(!eventId) {
      console.log("Waiting for more messages");
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }
    let event = nostr.eventsById.get(eventId);
    globalMessages.delete(eventId);

    let containsKeyword = false;

    for(let i=0; i<poolClient.poolConfig.keywords.length; i++) {
      let keyword = poolClient.poolConfig.keywords[i];
      containsKeyword = Object.keys(event).some((key: string) => {
        const value = event[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        } else {
          return false;
        }
      });
    }

    if(!containsKeyword) {
      nostr.latestNotesByEveryone.delete(eventId);
      continue;
    }

    // getRepliesAndLikes does't return a Promise. It calls the callback
    // an unkown number of times for an unknown number of replies etc...
    // we still want to process sync here so we wait for a certain amount 
    // of time compiling replies and then proceed. This wrapping is done
    // to make the async call to nostr.getRepliesAndLikes into sync for now
    let [replies, likedBy]: [Set<String>, Set<String>] = await new Promise((resolve, reject) => {
      let allReplies: Set<String> = new Set();
      let allLikedBy: Set<String> = new Set();
      let timeoutId: NodeJS.Timeout;
    
      const callback = (repliesI: Set<string>, likedByI: Set<string>, _threadReplyCountI: number) => {
        repliesI.forEach(r => allReplies.add(r));
        likedByI.forEach(l => allLikedBy.add(l));
    
        // Reset the timeout each time a callback is received
        // if nothing has been received in 2 seconds resolve the promise
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve([allReplies, allLikedBy]);
        }, 2000);
      };
    
      nostr.getRepliesAndLikes(eventId, callback);
    
      // Set the initial timeout, if no callbacks in this time, resolve
      timeoutId = setTimeout(() => {
        resolve([allReplies, allLikedBy]);
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
    
    // subscribe to the profile event and wait until we get it back
    let profile = await getProfile(event, nostr);

    let eventWithProfile = {
      post: event,
      profile: profile,
      likes: likedBy
    };

    processEvent(
      poolClient, 
      {
        event: eventWithProfile, 
        associationId: sortedReplies.length > 0 ? event.id : null, 
        associationSequence: sortedReplies.length > 0 ? "0" : null, 
        contentModeration: false
      }
    ).then(() => {});

    for(let i=0; i<sortedReplies.length; i++) {
      let id = sortedReplies[i].toString();
      let orderedEvent = nostr.eventsById.get(id);

      // subscribe to the profile event and wait until we get it back
      let profileForOrderedEvent = await getProfile(orderedEvent, nostr);

      let orderedEventWithProfile = {
        post: orderedEvent,
        profile: profileForOrderedEvent
      };

      processEvent(
        poolClient, 
        {
          event: orderedEventWithProfile, 
          associationId: sortedReplies.length > 0 ? event.id : null, 
          associationSequence: sortedReplies.length > 0 ? (i + 1).toString() : null, 
          contentModeration: false
        }
      ).then(() => {});
    }
  }
}

// TODO: fetch profile not working
async function getProfile(event: any, nostr: any) {
  let profile = await new Promise((resolve, _reject) => {
    // if(nostr.profileEventByUser.has(event.pubkey)){
    //   resolve(nostr.profileEventByUser.get(event.pubkey));
    // }

    // const callback = (profile: any, address: string) => {
    //   resolve(profile);
    // };

    // // console.log("looking for profile")
    // nostr.getProfile(event.pubkey, callback);
    // setTimeout(() => {
    //   // console.log("could not find profile")
    //   resolve(event.pubkey);
    // }, 4000);

    resolve(event.pubkey);
  });

  return profile;
}