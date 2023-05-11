export default class ArweaveClient {
    bundlr: any;
    arweaveGet: any;
    arweavePost: any;
    warp: any;
    constructor(bundlrJwk?: any);
    isDuplicate(args: {
        artifactName: string;
        poolId: string;
    }): Promise<boolean>;
}
