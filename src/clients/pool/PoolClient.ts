import fs from "fs";
import * as tApiV2 from "twitter-api-v2";

import Bundlr from "@bundlr-network/client";
import { Contract, LoggerFactory } from "warp-contracts";

import { ArweaveClient } from "../arweave";
import { PoolConfigType, IPoolClient } from "../../types";

export default class PoolClient implements IPoolClient {
    arClient = new ArweaveClient();

    poolConfig: PoolConfigType;
    walletKey: string | null;

    twitterV2: tApiV2.TwitterApi;
    twitterV2Bearer: tApiV2.TwitterApi;

    bundlr: Bundlr;
    contract: Contract;
    warp: any;

    constructor(poolConfig: PoolConfigType) {
        LoggerFactory.INST.logLevel("fatal");

        this.poolConfig = poolConfig;

        try {
            this.walletKey = JSON.parse(fs.readFileSync(
                this.poolConfig.walletPath
            ).toString());
        }
        catch {
            this.walletKey = null;
        }

        this.twitterV2 = new tApiV2.TwitterApi({
            appKey: poolConfig.twitterApiKeys.consumer_key,
            appSecret: poolConfig.twitterApiKeys.consumer_secret,
            accessToken: poolConfig.twitterApiKeys.token,
            accessSecret: poolConfig.twitterApiKeys.token_secret,
        });
        this.twitterV2Bearer = new tApiV2.TwitterApi(poolConfig.twitterApiKeys.bearer_token);

        this.bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", this.walletKey);
        this.contract = this.arClient.warp.contract(poolConfig.contracts.pool.id).setEvaluationOptions({
            allowBigInt: true
        });
        this.warp = this.arClient.warp;
    }
}