import Arweave from "arweave";
import { WarpFactory, defaultCacheOptions } from "warp-contracts";

const GET_ENDPOINT = "arweave-search.goldsky.com";
const POST_ENDPOINT = "arweave.net";

const PORT = 443;
const PROTOCOL = "https";
const TIMEOUT = 40000;
const LOGGING = false;

export default class ArweaveClient {
    arweaveGet: any = Arweave.init({
        host: GET_ENDPOINT,
        port: PORT,
        protocol: PROTOCOL,
        timeout: TIMEOUT,
        logging: LOGGING
    });

    arweavePost: any = Arweave.init({
        host: POST_ENDPOINT,
        port: PORT,
        protocol: PROTOCOL,
        timeout: TIMEOUT,
        logging: LOGGING
    });
    
    warp: any = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });
}