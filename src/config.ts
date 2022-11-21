export const APP_TITLE = "arc-pools";

export const CLI_ARGS = {
    create: "create",
    mineArtifacts: "mine",
    help: "help"
}

export const POOLS_PATH = "./local/pools.json";
// export const POOLS_PATH = "local/test-pools.json";

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