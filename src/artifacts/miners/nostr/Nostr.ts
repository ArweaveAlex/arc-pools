import { Relay, relayInit, Event, Sub, Filter,  } from "nostr-tools";
import { sha256 } from '@noble/hashes/sha256';
import 'websocket-polyfill';
import { debounce, throttle } from 'lodash';
const bech32 = require('bech32-buffer');

import { DEFAULT_NOSTR_RELAYS } from "../../../helpers/config";
import { SortedLimitedEventSet } from "./event-set";

// shortened version of iris-messenger Nostr.ts

const eventsById = new Map<string, Event>();

const defaultRelays = new Map<string, Relay>(
    DEFAULT_NOSTR_RELAYS.map((url) => [url.socket, relayInit(url.socket, (id) => eventsById.has(id))]),
);

type Subscription = {
    filters: Filter[];
    callback?: (event: Event) => void;
};

let subscriptionId = 0;

const MAX_LATEST_MSGS = 500000;

const startTime = Date.now() / 1000;

const getRelayStatus = (relay: Relay) => {
  // workaround for nostr-tools bug
  try {
    return relay.status;
  } catch (e) {
    return 3;
  }
}

export const Nostr = {
    profiles: new Map<string, any>(),
    relays: defaultRelays,
    subscriptionsByName: new Map<string, Set<Sub>>(),
    subscribedFiltersByName: new Map<string, Filter[]>(),
    subscribedPosts: new Set<string>(),
    subscriptions: new Map<number, Subscription>(),
    eventsById,
    latestNotesByEveryone: new SortedLimitedEventSet(MAX_LATEST_MSGS),
    profileEventByUser: new Map<string, Event>(),
    threadRepliesByMessageId: new Map<string, Set<string>>(),
    directRepliesByMessageId: new Map<string, Set<string>>(),
    likesByMessageId: new Map<string, Set<string>>(),
    maxRelays: DEFAULT_NOSTR_RELAYS.length,

    arrayToHex(array: any) {
      return Array.from(array, (byte: any) => {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
      }).join('');
    },

    getSubscriptionIdForName(name: string) {
      return this.arrayToHex(sha256(name)).slice(0, 8);
    },

    sendSubToRelays: function (filters: Filter[], id: string, once = false, unsubscribeTimeout = 0) {
        // if subs with same id already exists, remove them
        if (id) {
          const subs = this.subscriptionsByName.get(id);
          if (subs) {
            subs.forEach((sub: any) => {
              console.log('unsub', id);
              sub.unsub();
            });
          }
          this.subscriptionsByName.delete(id);
          this.subscribedFiltersByName.delete(id);
        }
    
        this.subscribedFiltersByName.set(id, filters);
    
        if (unsubscribeTimeout) {
          setTimeout(() => {
            this.subscriptionsByName.delete(id);
            this.subscribedFiltersByName.delete(id);
          }, unsubscribeTimeout);
        }
    
        for (const relay of this.relays.values()) {
          const subId = this.getSubscriptionIdForName(id);
          const sub = relay.sub(filters, { id: subId });
          // TODO update relay lastSeen
          sub.on('event', (event: any) => this.handleEvent(event));
          if (once) {
            sub.on('eose', () => sub.unsub());
          }
          if (!this.subscriptionsByName.has(id)) {
            this.subscriptionsByName.set(id, new Set());
          }
          this.subscriptionsByName.get(id)?.add(sub);
          //console.log('subscriptions size', this.subscriptionsByName.size);
          if (unsubscribeTimeout) {
            setTimeout(() => {
              sub.unsub();
            }, unsubscribeTimeout);
          }
        }
      },

      toNostrHexAddress(str: string): string | null {
        if (str.match(/^[0-9a-fA-F]{64}$/)) {
          return str;
        }
        try {
          const { data } = bech32.decode(str);
          const addr = this.arrayToHex(data);
          return addr;
        } catch (e) {
          // not a bech32 address
        }
        return null;
      },

      toNostrBech32Address: function (address: string, prefix: string) {
        if (!prefix) {
          throw new Error('prefix is required');
        }
        try {
          const decoded = bech32.decode(address);
          if (prefix !== decoded.prefix) {
            return null;
          }
          return bech32.encode(prefix, decoded.data);
        } catch (e) {
          // not a bech32 address
        }
    
        if (address.match(/^[0-9a-fA-F]{64}$/)) {
          const words = Buffer.from(address, 'hex');
          return bech32.encode(prefix, words);
        }
        return null;
      },

      handleEvent(event: Event, force = false) {
        // console.log(event)
        if (!event) return;
        if (this.eventsById.has(event.id) && !force) {
          return;
        }

        switch (event.kind) {
          case 0:
            if (this.handleMetadata(event) === false) {
              return;
            }
            break;
          case 1:
            if (this.isBoost(event)) {
              break;
            } else {
              this.handleNote(event);
            }
            break;
        case 7:
            this.handleReaction(event);
            break;

        }
    
        // go through subscriptions and callback if filters match
        for (const sub of this.subscriptions.values()) {
          if (!sub.filters) {
            return;
          }
          if (this.matchesOneFilter(event, sub.filters)) {
            sub.callback && sub.callback(event);
          }
        }
      },
      
      matchesOneFilter(event: Event, filters: Filter[]) {
        for (const filter of filters) {
          if (this.matchFilter(event, filter)) {
            return true;
          }
        }
        return false;
      },

      matchFilter(event: Event, filter: Filter) {
        if (filter.ids && !filter.ids.includes(event.id)) {
          return false;
        }
        if (filter.kinds && !filter.kinds.includes(event.kind)) {
          return false;
        }
        if (filter.authors && !filter.authors.includes(event.pubkey)) {
          return false;
        }
        const filterKeys = ['e', 'p', 'd'];
        for (const key of filterKeys) {
          if (
            filter[`#${key}`] &&
            !event.tags.some((tag) => tag[0] === key && filter[`#${key}`].includes(tag[1]))
          ) {
            return false;
          }
        }
        if (filter['#d']) {
          const tag = event.tags.find((tag) => tag[0] === 'd');
          if (tag) {
            const existing = this.keyValueEvents.get(tag[1]);
            if (existing?.created_at > event.created_at) {
              return false;
            }
          }
        }
    
        return true;
      },

      getEventReplyingTo: function (event: Event) {
        if (event.kind !== 1) {
          return undefined;
        }
        const replyTags = event.tags.filter((tag) => tag[0] === 'e');
        if (replyTags.length === 1) {
          return replyTags[0][1];
        }
        const replyTag = event.tags.find((tag) => tag[0] === 'e' && tag[3] === 'reply');
        if (replyTag) {
          return replyTag[1];
        }
        if (replyTags.length > 1) {
          return replyTags[1][1];
        }
        return undefined;
      },

      handleNote(event: Event) {
        this.eventsById.set(event.id, event);
    
        this.latestNotesByEveryone.add(event);

        // todo: handle astral ninja format boost (retweet) message
        // where content points to the original message tag: "content": "#[1]"
    
        const isBoost = this.isBoost(event);
        const replyingTo = this.getEventReplyingTo(event);
        if (replyingTo && !isBoost) {
          if (!this.directRepliesByMessageId.has(replyingTo)) {
            this.directRepliesByMessageId.set(replyingTo, new Set<string>());
          }
          this.directRepliesByMessageId.get(replyingTo)?.add(event.id);
    
          const repliedMsgs = event.tags
            .filter((tag) => tag[0] === 'e')
            .map((tag) => tag[1])
            .slice(0, 2);
          for (const id of repliedMsgs) {
            if (
              event.created_at > startTime
            ) {
              this.getMessageById(id);
            }
            if (!this.threadRepliesByMessageId.has(id)) {
              this.threadRepliesByMessageId.set(id, new Set<string>());
            }
            this.threadRepliesByMessageId.get(id)?.add(event.id);
          }
        } 
      },

      handleReaction(event: Event) {
        const id = event.tags.reverse().find((tag: any) => tag[0] === 'e')?.[1]; // last e tag is the liked post
        if (!id) return;
        if (!this.likesByMessageId.has(id)) {
          this.likesByMessageId.set(id, new Set());
        }
        this.likesByMessageId.get(id).add(event.pubkey);
      },

      isBoost(event: Event) {
        const mentionIndex = event.tags.findIndex((tag) => tag[0] === 'e' && tag[3] === 'mention');
        if (event.content === `#[${mentionIndex}]`) {
          return true;
        } else {
          return false;
        }
      },

      subscribeToRepliesAndLikes: (_this: any) => {
        // console.log('subscribeToRepliesAndLikes', _this.subscribedRepliesAndLikes);
        _this.sendSubToRelays(
          [{ kinds: [1, 6, 7], '#e': Array.from(_this.subscribedRepliesAndLikes.values()) }],
          'subscribedRepliesAndLikes',
          false,
        );
      },

      subscribeToPosts: throttle(
        (_this: any) => {
          if (_this.subscribedPosts.size === 0) return;
          //console.log('subscribe to', _this.subscribedPosts.size, 'posts');
          _this.sendSubToRelays([{ ids: Array.from(_this.subscribedPosts) }], 'posts');
        },
        3000,
        { leading: false },
      ),

      subscribe: function (filters: Filter[], cb?: (event: Event) => void) {
        cb &&
          this.subscriptions.set(subscriptionId++, {
            filters,
            callback: cb,
          });
    
        let hasNewIds = false;
        let hasNewReplyAndLikeSubs = false;
        for (const filter of filters) {
          if (filter.ids) {
            for (const id of filter.ids) {
              if (!this.subscribedPosts.has(id)) {
                hasNewIds = true;
                this.subscribedPosts.add(this.toNostrHexAddress(id));
              }
            }
          }
          if (Array.isArray(filter['#e'])) {
            for (const id of filter['#e']) {
              if (!this.subscribedRepliesAndLikes.has(id)) {
                hasNewReplyAndLikeSubs = true;
                this.subscribedRepliesAndLikes.add(id);
                setTimeout(() => {
                  // remove after some time, so the requests don't grow too large
                  this.subscribedRepliesAndLikes.delete(id);
                }, 60 * 1000);
              }
            }
          }
        }
        hasNewReplyAndLikeSubs && this.subscribeToRepliesAndLikes(this);
        hasNewIds && this.subscribeToPosts(this);
      },

      getRepliesAndLikes(
        id: string,
        cb?: (
          replies: Set<string>,
          likedBy: Set<string>,
          threadReplyCount: number,
        ) => void,
      ) {
        const callback = () => {
          cb &&
            cb(
              this.directRepliesByMessageId.get(id) ?? new Set(),
              this.likesByMessageId.get(id) ?? new Set(),
              this.threadRepliesByMessageId.get(id)?.size ?? 0,
            );
        };
        if (this.directRepliesByMessageId.has(id) || this.likesByMessageId.has(id)) {
          callback();
        }
        this.subscribe([{ kinds: [1, 6, 7], '#e': [id] }], callback);
      },

      async getMessageById(id: string) {
        if (this.eventsById.has(id)) {
          return this.eventsById.get(id);
        }
    
        return new Promise((resolve) => {
          this.subscribe([{ ids: [id] }], () => {
            // TODO turn off subscription
            const msg = this.eventsById.get(id);
            msg && resolve(msg);
          });
        });
      },

      getMessagesByEveryone(cb: (messageIds: string[]) => void) {
        const callback = () => {
          cb(this.latestNotesByEveryone.eventIds);
        };
        callback();
        this.subscribe([{ kinds: [1, 7] }], callback);
      },

      handleMetadata(event: Event) {
        try {
          const existing = this.profiles.get(event.pubkey);
          if (existing?.created_at >= event.created_at) {
            return false;
          }
          const profile = JSON.parse(event.content);
          profile.created_at = event.created_at;
          delete profile['nip05valid']; // not robust
          this.profiles.set(event.pubkey, profile);
          const key = this.toNostrBech32Address(event.pubkey, 'npub');

          const existingEvent = this.profileEventByUser.get(event.pubkey);
          if (!existingEvent || existingEvent.created_at < event.created_at) {
            this.profileEventByUser.set(event.pubkey, event);
          }
          return true;
        } catch (e) {
          console.log('error parsing nostr profile', e, event);
          return false;
        }
      },

      
      connectRelay: function (relay: Relay) {
        try {
          relay.connect().catch((e) => {
            console.log(e);
          });
        } catch (e) {
          console.log(e);
        }
      },

      manageRelays: function () {
        const go = () => {
          const relays: Array<Relay> = Array.from(this.relays.values());
          const openRelays = relays.filter((relay: Relay) => getRelayStatus(relay) === 1);
          const connectingRelays = relays.filter((relay: Relay) => getRelayStatus(relay) === 0);
          if (openRelays.length + connectingRelays.length < this.maxRelays) {
            const closedRelays = relays.filter((relay: Relay) => getRelayStatus(relay) === 3);
            if (closedRelays.length) {
              const newRelay = relays[Math.floor(Math.random() * relays.length)];
              this.connectRelay(newRelay);
            }
          }
          if (openRelays.length > this.maxRelays) {
            openRelays[Math.floor(Math.random() * openRelays.length)].close();
          }
        };
    
        for (let i = 0; i < this.maxRelays; i++) {
          go();
        }
    
        setInterval(go, 1000);
      },

      init: function() {
        this.manageRelays();
        this.sendSubToRelays([{ kinds: [0, 1, 3, 7]}], 'new'); // everything new
      }
}
