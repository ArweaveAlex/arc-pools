import path from "path";

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
        sindex: "sindex",
        fetch: "fetch"
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
        appType:"App-Type",
        poolName: "Pool-Name",
        uploaderTxId: "Uploader-Tx-Id",
        poolId: "Pool-Id",
        artifactType: "Artifact-Type",
        // this ones for the search index
        alexPoolId: "Alex-Pool-Id",
        initialOwner: "Initial-Owner"
    },
    values: {
        poolVersions: {
            "1.2": "Alex-Archiving-Pool-v1.2",
            "1.4": "Alex-Archiving-Pool-v1.4"
        }
    }
}

export const STORAGE = {
    none: "N/A"
}

export const PAGINATOR = 100;

export const CURSORS = {
    p1: "P1",
    end: "END"
}

export const FALLBACK_IMAGE = "8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA";

export const MODERATION_THRESHOLDS = {
    explicit: 0.10,
    suggestive: 0.80
}

// top level data directory for indexing
export const INDEX_FILE_DIR = "sindex";

// characters surrounding artifact ids in index file
export const ID_CHAR = '`*';

// characters surrounding owver pubkey in index file
export const OWNER_CHAR = '`%';

// arbitrary spread of index files
export const FILE_INDEXES = ['1', '2', '3', '4', '5'];

// subdir to INDEX_FILE_DIR
export const INDECES_DIR = "/indeces/";

// file for picking up where we left off when indexing
export const FINAL_INDEX_FILE_NAME = "/finalindex";