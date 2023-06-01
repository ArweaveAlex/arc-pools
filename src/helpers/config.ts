import path from "path";
import * as tApiV2 from "twitter-api-v2";

export const APP_TITLE = "arcpool";

/**
 *  Find the base directory of the repo
 *  so the code runs in global install
 *  as well as local ts-node run and
 *  global install from local repo "npm install --global"
 */
let dirIndex = path.join(__dirname, "").indexOf("arc-pools") > -1 ? "arc-pools" : "arcpool";
export let BASE_DIR = path.join(__dirname, "").split(dirIndex)[0] + dirIndex;

export const NFT_CONTRACT_PATH = path.join(BASE_DIR, "bin/contracts/NFT/contract.js");
export const NFT_JSON_PATH = path.join(BASE_DIR, "bin/contracts/NFT/init.json");
export const POOL_CONTRACT_PATH = path.join(BASE_DIR, "bin/contracts/pool/contract.js");
export const POOL_SEARCH_CONTRACT_PATH = path.join(BASE_DIR, "bin/contracts/search/contract.js");

export const POOL_FILE = "pools.json";

export const CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help",
        dlist: "dlist",
        dstop: "dstop",
        init: "init",
        fund: "fund",
        balance: "balance",
        fetch: "fetch",
        sindex: "sindex",
        evolve: "evolve",
        topics: "topics"
    },
    options: {
        source: "source",
        method: "method",
        mentionTag: "mention-tag",
        dname: "dname",
        poolConfig: "pool-conf",
        controlWallet: "control-wallet",
        contentModeration: "content-moderation",
        image: "image",
        clear: "clear",
        subreddit: "subreddit",
        searchTerm: "search-term",
        path: "path",
        metaFile: "meta-file",
        topicValues: "topic-values"
    },
    sources: {
        twitter: {
            name: "twitter",
            methods: {
                stream: "stream",
                mention: "mention",
                user: "user"
            }
        },
        wikipedia: {
            name: "wikipedia"
        },
        reddit: {
            name: "reddit",
            methods: {
                subreddit: "subreddit",
                user: "user",
                posts: "posts",
                search: "search"
            }
        },
        webpage: {
            name: "webpage"
        },
        nostr: {
            name: "nostr"
        },
        files: {
            name: "files"
        }
    }
}

export const MODERATION_THRESHOLDS = {
    explicit: 0.10,
    suggestive: 0.80
}

export const TWEET_FIELDS: tApiV2.TTweetv2TweetField[] = [
    "id",
    "attachments", 
    "author_id", 
    "context_annotations", 
    "conversation_id", 
    "created_at", 
    "entities", 
    "geo", 
    "in_reply_to_user_id", 
    "lang", 
    "edit_controls", 
    "possibly_sensitive", 
    "referenced_tweets", 
    "reply_settings", 
    "source", 
    "text", 
    "withheld", 
    "public_metrics"
];

const EXPANSIONS: tApiV2.TTweetv2Expansion[] = [
    "attachments.poll_ids", 
    "attachments.media_keys", 
    "author_id", 
    "referenced_tweets.id", 
    "in_reply_to_user_id", 
    "edit_history_tweet_ids", 
    "geo.place_id", 
    "entities.mentions.username", 
    "referenced_tweets.id.author_id"
];

const MEDIA_FIELDS: tApiV2.TTweetv2MediaField[] = [
    "duration_ms", 
    "height", 
    "media_key", 
    "preview_image_url", 
    "type", 
    "url", 
    "width", 
    "alt_text", 
    "variants"
];

const PLACE_FIELDS: tApiV2.TTweetv2PlaceField[] = [
    "name",
    "contained_within", 
    "country", 
    "country_code", 
    "full_name", 
    "geo", 
    "id", 
    "place_type"
];

const POLL_FIELDS: tApiV2.TTweetv2PollField[] = [
    "duration_minutes", 
    "end_datetime", 
    "id", 
    "options", 
    "voting_status"
];

const USER_FIELDS: tApiV2.TTweetv2UserField[] = [
    "id",
    "created_at", 
    "description", 
    "entities", 
    "location", 
    "name", 
    "pinned_tweet_id", 
    "profile_image_url", 
    "protected", 
    "public_metrics", 
    "url", 
    "username", 
    "verified", 
    "withheld"
];

export const STREAM_PARAMS = {
    "expansions": EXPANSIONS,
    "media.fields": MEDIA_FIELDS,
    "place.fields": PLACE_FIELDS,
    "poll.fields": POLL_FIELDS,
    "tweet.fields": TWEET_FIELDS,
    "user.fields": USER_FIELDS,
    backfill_minutes: 0
}

export const LOOKUP_PARAMS = {
    "expansions": EXPANSIONS,
    "media.fields": MEDIA_FIELDS,
    "place.fields": PLACE_FIELDS,
    "poll.fields": POLL_FIELDS,
    "tweet.fields": TWEET_FIELDS,
    "user.fields": USER_FIELDS
}

export const RELAY_OVERHEAD_LIMIT = 1000;
export const RELAY_QUEUE_PROC_SIZE = 10;

export const POOL_TEST_MODE = false;