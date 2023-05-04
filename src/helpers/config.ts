import path from "path";
import * as tApiV2 from "twitter-api-v2";
import { ArtifactEnum } from "./types";

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

export const RENDER_WITH_VALUE = ["alex-renderers", "5A-B2_KnvkoMOxM51ulfSzppmLGJ-UBQ317sMri1vpY", "1AqTXu6JyPWMZnRYJozf184bw1ph0mwlka67EgQLTa8"];

export const TAGS = {
    keys: {
        alexPoolId: "Alex-Pool-Id",
        appName: "App-Name",
        appType: "App-Type",
        appVersion: "App-Version",
        application: "Application",
        artifactName: "Artifact-Name",
        artifactSeries: "Artifact-Series",
        artifactType: "Artifact-Type",
        associationId: "Association-Id",
        associationSequence: "Association-Sequence",
        childAssets: "Child-Assets",
        contentType: "Content-Type",
        contractSrc: "Contract-Src",
        dataProtocol: "Data-Protocol",
        dateCreated: "Date-Created",
        description: "Description",
        fileType: "File-Type",
        implements: "Implements",
        initialOwner: "Initial-Owner",
        initState: "Init-State",
        keywords: "Keywords",
        license: "License",
        mediaIds: "Media-Ids",
        renderWith: "Render-With",
        poolId: "Pool-Id",
        poolName: "Pool-Name",
        profileImage: "Profile-Image",
        title: "Title",
        topic: (topic: string) => `Topic:${topic}`,
        tweetId: "Tweet-ID",
        redditPostId: "Reddit-Post-ID",
        nostrEventId: "Nostr-Event-ID",
        type: "Type",
        uploaderTxId: "Uploader-Tx-Id",
    },
    values: {
        ansVersion: "ANS-110",
        ansTypes: {
            socialPost: "social-post",
            webPage: "web-page",
            image: "image",
            video: "video",
            music: "music",
            document: "document",
            file: "file",
            collection: "collection"
        },
        appName: "SmartWeaveContract",
        appVersion: "0.3.0",
        application: "Alex.",
        initState: {
            name: (name: string) => `Artifact - ${name}`,
            ticker: (assetId: string) => `ATOMIC-ASSET-${assetId}`,
            title: (name: string) => `Alex Artifact - ${name}`
        },
        license: "x5UYiin_eRB0XCpZAkpduL0JIaXAUe9Bi2-RXGloBQI",
        poolVersions: {
            "1.2": "Alex-Archiving-Pool-v1.2",
            "1.4": "Alex-Archiving-Pool-v1.4",
            "1.5": "Alex-Archiving-Pool-v1.5"
        },
        topic: (topic: string) => `Topic:${topic}`
    }
}

export const CONTENT_TYPES = {
    arweaveManifest: "application/x.arweave-manifest+json",
    json: "application/json",
    octetStream: "application/octet-stream",
    textHtml: "text/html"
}

export const STORAGE = {
    none: "N/A"
}

export const PAGINATOR = 100;

export const CURSORS = {
    p1: "P1",
    end: "END"
}

export const MANIFEST = {
    type: "arweave/paths",
    version: "0.1.0"
}

export const FALLBACK_IMAGE = "8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA";

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

// Top level data directory for indexing
export const INDEX_FILE_DIR = "sindex";

// Characters surrounding artifact ids in index file
export const ID_CHAR = '`*';

// Characters surrounding owver pubkey in index file
export const OWNER_CHAR = '`%';

// Arbitrary spread of index files
export const FILE_INDEXES = ['1', '2', '3', '4', '5'];

// Subdir to INDEX_FILE_DIR
export const INDECES_DIR = "/indeces/";

// File for picking up where we left off when indexing
export const FINAL_INDEX_FILE_NAME = "/finalindex";

export const REDSTONE_PAGE_LIMIT = 5000;

export const DEFAULT_NOSTR_RELAYS = [
   {socket: "wss://relay.damus.io"},
   {socket: "wss://nos.lol"},
   {socket: "wss://nostr.relayer.se"},
   {socket: "wss://relay.current.fyi"},
   {socket: "wss://nostr.bitcoiner.social"},
   {socket: "wss://relay.nostr.info"},
   {socket: "wss://nostr.fmt.wiz.biz"}
];

export const RELAY_OVERHEAD_LIMIT = 1000;
export const RELAY_QUEUE_PROC_SIZE = 10;

export const DEFAULT_POOLS_JSON = 
     {
        "appType": TAGS.values.poolVersions["1.5"], 
        "contracts": {
            "nft": {
                "id": "",
                "src": ""
            },
            "pool": {
                "id": "",
                "src": ""
            },
        },
        "state": {
            "owner": {
                "pubkey": "",
                "info": ""
            },
            "controller": {
                "pubkey": "",
                "contribPercent": 0
            },
            "title": "Pool Title such as Russia Ukraine War",
            "description": "Paragraph/html markup for long pool description on site",
            "briefDescription": "Text for short pool description on site",
            "image": "",
            "timestamp": "",
            "ownerMaintained": false
        },
        "walletPath": "",
        "bundlrNode": "https://node2.bundlr.network",
        "keywords": [
            "keyword1",
        ],
        "twitterApiKeys": {
            "consumer_key": "",
            "consumer_secret": "",
            "token": "",
            "token_secret": "",
            "bearer_token": ""
        },
        "clarifaiApiKey": "",
        "topics": [
            "History"
        ],
        "redditApiKeys": {
            "username": "",
            "password": "",
            "appId": "",
            "appSecret": ""
        },
        "nostr": {
            "relays": DEFAULT_NOSTR_RELAYS
        }
};


export const ARTIFACT_TYPES_BY_FILE: { [ext: string]: ArtifactEnum } = {
    // Images
    'jpg': ArtifactEnum.Image,
    'jpeg': ArtifactEnum.Image,
    'png': ArtifactEnum.Image,
    'gif': ArtifactEnum.Image,
    'bmp': ArtifactEnum.Image,
    'tiff': ArtifactEnum.Image,
    'svg': ArtifactEnum.Image,
    'webp': ArtifactEnum.Image,
    // Documents
    'pdf': ArtifactEnum.Document,
    'txt': ArtifactEnum.Document,
    'csv': ArtifactEnum.Document, 
    'doc': ArtifactEnum.Document,
    'docx': ArtifactEnum.Document,
    'xls': ArtifactEnum.Document,
    'xlsx': ArtifactEnum.Document,
    'ppt': ArtifactEnum.Document,
    'pptx': ArtifactEnum.Document,
    'rtf': ArtifactEnum.Document, 
    // Audio
    'mp3': ArtifactEnum.Audio,
    'm4a': ArtifactEnum.Audio,
    'wav': ArtifactEnum.Audio,
    'ogg': ArtifactEnum.Audio,
    'flac': ArtifactEnum.Audio,
    // Video
    'mp4': ArtifactEnum.Video,
    'mpg': ArtifactEnum.Video,
    'avi': ArtifactEnum.Video,
    'wmv': ArtifactEnum.Video,
    'mov': ArtifactEnum.Video,
    'mkv': ArtifactEnum.Video,
    // Ebooks
    'epub': ArtifactEnum.Ebook,
};