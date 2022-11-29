import path from "path";

export const APP_TITLE = "arcpool";

/**
 *  Find the base directory of the repo
 *  so the code runs in global install
 *  as well as local ts-node run 
 */
export const BASE_DIR = path.join(__dirname, "").split("arc-pools")[0] + "arc-pools";

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
        init: "init"
    },
    options: {
        source: "source",
        method: "method",
        mentionTag: "mention-tag",
        dname: "dname",
        poolConfig: "pool-conf",
        controlWallet: "control-wallet",
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
        poolName: "Pool-Name"
    },
    values: {
        poolv1: "Alex-Archiving-Pool-v1.2"    
    }
}

export const FALLBACK_IMAGE = "8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA";