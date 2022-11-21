export declare const APP_TITLE = "arc-pools";
export declare const CLI_ARGS: {
    create: string;
    mineArtifacts: string;
    help: string;
};
export declare const POOLS_PATH = "./local/pools.json";
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
