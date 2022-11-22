import * as path from "path";

export const APP_TITLE = "arc-pools";

const baseDir = path.join(__dirname, '../local');

export const POOLS_PATH = "local/testPools.json";
export const CONTROL_WALLET_PATH = "local/wallets/walletControl.json";
export const NFT_CONTRACT_PATH = "src/contracts/NFT/contract.ts";
export const NFT_JSON_PATH = "src/contracts/NFT/init.json";
export const POOL_CONTRACT_PATH = "src/contracts/pool/contract.ts";

export const CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help"
    },
    options: {
        source: "source",
        method: "method",
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