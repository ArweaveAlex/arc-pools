import path from "path";

export const APP_TITLE = "arc-pools";

/**
 *  find the base directory of the repo
 *  so the code runs in global install
 *  as well as local ts-node run 
 */
export const BASE_DIR = path.join(__dirname, "").split("arc-pools")[0] + "arc-pools";

export const NFT_CONTRACT_PATH = path.join(BASE_DIR, "build/contracts/NFT/contract.js");
export const NFT_JSON_PATH = path.join(BASE_DIR, "build/contracts/NFT/init.json");
export const POOL_CONTRACT_PATH = path.join(BASE_DIR, "build/contracts/pool/contract.js");

export const CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help",
        dlist: "dlist",
        dstop: "dstop"
    },
    options: {
        source: "source",
        method: "method",
        mentionTag: "mention-tag",
        dname: "dname",
        poolConfig: "pool-conf",
        controlWallet: "control-wallet"
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

export type Config = { 
    instances: number, 
    query: string, 
    walletPath: string, 
    bundlrNode: string, 
    difference: number, 
    refreshPeriod: string, 
    keywordListID: string, 
    pool: { 
        contract: string, 
        transferable: boolean 
    }, 
    nftContractSrc: string, 
    keywordListVersion: string,
    keywords: string[],
    userIDs: string[],
    balanceUrl: string,
    mineAllTweetsUserIDs: string[],
    mentionTags: string[]
};