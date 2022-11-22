import { SourceImpl } from "warp-contracts";
export default class ArweaveClient {
    arweave: any;
    smartweave: import("warp-contracts").Warp;
    warp: import("warp-contracts").Warp;
    sourceImpl: SourceImpl;
    getPoolIds(): Promise<any>;
    getAllPools(): Promise<any>;
}
