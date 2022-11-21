export const APP_TITLE = "arc-pools";

export const POOLS_PATH = "local/test-pools.json";
export const CONTROL_WALLET_PATH = "local/wallets/control-wallet.json";
export const NFT_CONTRACT_PATH = "build/contracts/NFT/contract.js";
export const NFT_JSON_PATH = "build/contracts/NFT/init.json";
export const POOL_CONTRACT_PATH = "build/contracts/pool/contract.js";

export const CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help"
    },
    options: {
        source: {
            name: "source"
        }
    },
    sources: {
        twitter: {
            name: "twitter"
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