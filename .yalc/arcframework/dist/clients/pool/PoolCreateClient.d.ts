/// <reference types="node" />
import { PoolConfigType } from "../../helpers";
import PoolClient from './PoolClient';
export declare function initNewPoolConfig(): {
    appType: string;
    contracts: {
        nft: {
            id: string;
            src: string;
        };
        pool: {
            id: string;
            src: string;
        };
    };
    state: {
        owner: {
            pubkey: string;
            info: string;
        };
        controller: {
            pubkey: string;
            contribPercent: number;
        };
        title: string;
        description: string;
        briefDescription: string;
        image: string;
        timestamp: string;
        ownerMaintained: boolean;
    };
    walletPath: string;
    keywords: string[];
    twitterApiKeys: {
        consumer_key: string;
        consumer_secret: string;
        token: string;
        token_secret: string;
        bearer_token: string;
    };
    clarifaiApiKey: string;
    topics: string[];
    redditApiKeys: {
        username: string;
        password: string;
        appId: string;
        appSecret: string;
    };
    nostr: {
        relays: {
            socket: string;
        }[];
    };
};
export default class PoolCreateClient {
    poolClient: PoolClient;
    poolConfig: PoolConfigType;
    controlWalletJwk: any;
    poolWalletJwk: any;
    poolWalletPath: string | null;
    img: Buffer;
    imgFileType: string;
    constructor(poolConfig: PoolConfigType, controlWalletJwk: any, poolWalletJwk: any, poolWalletPath: string | null, img: Buffer | null, imgFileType: string | null);
    createPool(): Promise<void>;
}
