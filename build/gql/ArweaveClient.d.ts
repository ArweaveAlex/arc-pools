import Arweave from "arweave";
export default class GQLCLient {
    arweave: Arweave;
    smartweave: import("warp-contracts").Warp;
    warp: import("warp-contracts").Warp;
    getPoolIds(): Promise<any>;
    getAllPools(): Promise<any>;
}
