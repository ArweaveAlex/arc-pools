export declare const APP_TITLE = "arc-pools";
export declare const POOLS_PATH = "local/testPools.json";
export declare const CONTROL_WALLET_PATH = "local/wallets/walletControl.json";
export declare const NFT_CONTRACT_PATH = "build/contracts/NFT/contract.js";
export declare const NFT_JSON_PATH = "build/contracts/NFT/init.json";
export declare const POOL_CONTRACT_PATH = "build/contracts/pool/contract.js";
export declare const CLI_ARGS: {
    commands: {
        create: string;
        mine: string;
        help: string;
        dlist: string;
    };
    options: {
        source: string;
        method: string;
        mentionTag: string;
        dname: string;
    };
    sources: {
        twitter: {
            name: string;
            methods: {
                stream: string;
                mention: string;
                user: string;
            };
        };
        wikipedia: {
            name: string;
        };
    };
};
export declare const TAGS: {
    keys: {
        appType: string;
        poolName: string;
    };
    values: {
        poolv1: string;
    };
};
export type Config = {
    instances: number;
    query: string;
    walletPath: string;
    bundlrNode: string;
    difference: number;
    refreshPeriod: string;
    keywordListID: string;
    pool: {
        contract: string;
        transferable: boolean;
    };
    nftContractSrc: string;
    keywordListVersion: string;
    keywords: string[];
    userIDs: string[];
    balanceUrl: string;
    mineAllTweetsUserIDs: string[];
    mentionTags: string[];
};
