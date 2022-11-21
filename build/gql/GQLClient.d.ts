import Arweave from "arweave";
export default class GQLCLient {
    arweave: Arweave;
    getAllPools(): Promise<void>;
}
