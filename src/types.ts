import * as tApiV2 from "twitter-api-v2";

import Bundlr from "@bundlr-network/client";
import { Contract } from "warp-contracts";

export enum ArtifactEnum {
    Messaging = "Alex-Messaging",
    Webpage = "Alex-Webpage"
}

export type GQLResponseType = {
    cursor: string | null
    node: {
        id: string
        tags: KeyValueType[]
        data: {
            size: string
            type: string
        }
    }
}

export interface IPoolClient {
    arClient: any;
    poolConfig: PoolConfigType;
    walletKey: string | null;
    twitterV2: tApiV2.TwitterApi;
    twitterV2Bearer: tApiV2.TwitterApi;
    bundlr: Bundlr;
    contract: Contract;
    warp: any;
}

export interface PoolType {
    id: string
    state: PoolStateType
}

export interface PoolStateType {
    title: string
    image: string
    briefDescription: string
    description: string
    link: string
    owner: string
    ownerInfo: string
    timestamp: string
    contributors: { [key: string]: string }
    tokens: { [key: string]: string }
    totalContributions: string
    totalSupply: string
    balance: string
    canEvolve: boolean
}

export type PoolConfigType = {
    appType: string,
    contracts: {
        nft: {
            id: NStringType
            src: NStringType
        },
        pool: {
            id: NStringType
            src: NStringType
        }
    },
    state: {
        owner: {
            pubkey: string
            info: string
        },
        title: string
        description: string
        briefDescription: string
        link: string
        rewards: string
        image: NStringType
        timestamp: NStringType
    },
    walletPath: string
    bundlrNode: string
    twitter: {
        userIds: string[]
    },
    keywords: string[]
    twitterApiKeys: any,
    clarifaiApiKey: string
}

export type TagFilterType = { name: string, values: string[] }

type NStringType = string | null
export type KeyValueType = { [key: string]: string }