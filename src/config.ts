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
        balance: "balance"
    },
    options: {
        source: "source",
        method: "method",
        mentionTag: "mention-tag",
        dname: "dname",
        poolConfig: "pool-conf",
        controlWallet: "control-wallet",
        contentModeration: "content-moderation",
        image: "image"
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
    }
}

export const TAGS = {
    keys: {
        appName: "App-Name",
        appType: "App-Type",
        appVersion: "App-Version",
        application: "Application",
        artifactName: "Artifact-Name",
        artifactSeries: "Artifact-Series",
        artifactType: "Artifact-Type",
        associationId: "Association-Id",
        associationSequence: "Association-Sequence",
        contentType: "Content-Type",
        contractSrc: "Contract-Src",
        dateCreated: "Date-Created",
        description: "Description",
        implements: "Implements",
        initialOwner: "Initial-Owner",
        initState: "Init-State",
        keywords: "Keywords",
        mediaIds: "Media-Ids",
        poolId: "Pool-Id",
        poolName: "Pool-Name",
        title: "Title",
        topic: "Topic",
        tweetId: "Tweet-ID",
        type: "Type",
        uploaderTxId: "Uploader-Tx-Id",
    },
    values: {
        ansVersion: "ANS-110",
        ansTypes: {
            socialPost: "social-post",
            webPage: "web-page"
        },
        appName: "SmartWeaveContract",
        appVersion: "0.3.0",
        application: "Alex.",
        initState: {
            name: (name: string) => `Artifact - ${name}`,
            ticker: (assetId: string) => `ATOMIC-ASSET-${assetId}`,
            title: (name: string) => `Alex Artifact - ${name}`
        },
        poolVersions: {
            "1.2": "Alex-Archiving-Pool-v1.2",
            "1.4": "Alex-Archiving-Pool-v1.4"
        },
        topic: (topic: string) => `Topic: ${topic}`
    }
}

export const CONTENT_TYPES = {
    arweaveManifest: "application/x.arweave-manifest+json",
    json: "application/json",
    octetStream: "application/octet-stream",
    textHtml: "text/html",
    webpage: "web-page"
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

const expansions: tApiV2.TTweetv2Expansion[] = ['attachments.poll_ids', 'attachments.media_keys', 'author_id', 'referenced_tweets.id', 'in_reply_to_user_id', 'edit_history_tweet_ids', 'geo.place_id', 'entities.mentions.username', 'referenced_tweets.id.author_id']
const mediaFields: tApiV2.TTweetv2MediaField[] = ['duration_ms', 'height', 'media_key', 'preview_image_url', 'type', 'url', 'width', 'alt_text', 'variants']
const placeFields: tApiV2.TTweetv2PlaceField[] = ['contained_within', 'country', 'country_code', 'full_name', 'geo', 'id', 'name', 'place_type']
const pollFields: tApiV2.TTweetv2PollField[] = ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status']
const tweetFields: tApiV2.TTweetv2TweetField[] = ['attachments', 'author_id', 'context_annotations', 'conversation_id', 'created_at', 'entities', 'geo', 'id', 'in_reply_to_user_id', 'lang', 'edit_controls', 'possibly_sensitive', 'referenced_tweets', 'reply_settings', 'source', 'text', 'withheld']
const userFields: tApiV2.TTweetv2UserField[] = ['created_at', 'description', 'entities', 'id', 'location', 'name', 'pinned_tweet_id', 'profile_image_url', 'protected', 'public_metrics', 'url', 'username', 'verified', 'withheld']

export const STREAM_PARAMS = {
    'expansions': expansions,
    'media.fields': mediaFields,
    'place.fields': placeFields,
    'poll.fields': pollFields,
    'tweet.fields': tweetFields,
    'user.fields': userFields,
    backfill_minutes: 0
}

export const LOOKUP_PARAMS = {
    'expansions': expansions,
    'media.fields': mediaFields,
    'place.fields': placeFields,
    'poll.fields': pollFields,
    'tweet.fields': tweetFields,
    'user.fields': userFields
}