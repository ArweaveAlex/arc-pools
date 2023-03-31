import fs from "fs";
import * as tApiV2 from "twitter-api-v2";
const Reddit = require('reddit');

import Bundlr from "@bundlr-network/client";
import { Contract, LoggerFactory } from "warp-contracts";

import { ArweaveClient } from "../arweave";
import { PoolConfigType, IPoolClient } from "../../helpers/types";
import { log } from "../../helpers/utils";

export default class PoolClient implements IPoolClient {
    arClient = new ArweaveClient();

    poolConfig: PoolConfigType;
    walletKey: string | null;

    twitterV2: tApiV2.TwitterApi;
    twitterV2Bearer: tApiV2.TwitterApi;

    bundlr: Bundlr;
    contract: Contract;
    warp: any;

    reddit: any;

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

       try {
            this.twitterV2 = new tApiV2.TwitterApi({
                appKey: poolConfig.twitterApiKeys.consumer_key,
                appSecret: poolConfig.twitterApiKeys.consumer_secret,
                accessToken: poolConfig.twitterApiKeys.token,
                accessSecret: poolConfig.twitterApiKeys.token_secret,
            });
            this.twitterV2Bearer = new tApiV2.TwitterApi(poolConfig.twitterApiKeys.bearer_token);
       } catch(e: any) {
            log("Twitter keys invalid, twitter mining unavailable, ignore this if you are not mining twitter", 1);
       }

        this.bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", this.walletKey);
        this.contract = this.arClient.warp.contract(poolConfig.contracts.pool.id).setEvaluationOptions({
            allowBigInt: true
        });
        this.warp = this.arClient.warp;

        this.reddit = new Reddit({
            username: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.username : "",
            password: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.password : "",
            appId: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.appId : "",
            appSecret: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.appSecret : "",
            userAgent: 'Alex/1.0.0 (http://alex.arweave.dev)'
        });
    }
}