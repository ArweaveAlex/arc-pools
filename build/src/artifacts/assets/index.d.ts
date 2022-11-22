import Bundlr from '@bundlr-network/client';
import Arweave from 'arweave';
import { Contract, Warp } from 'warp-contracts';
import { PoolConfigType } from "../../types";
export declare function selectTokenHolder(tokens: any, totalSupply: number): string;
export declare const generateTweetName: (tweet: any) => string;
export declare const createAsset: (bundlrIn: Bundlr, arweaveIn: Arweave, warpIn: Warp, contractIn: Contract, content: any, additionalPaths: any, poolConfig: PoolConfigType, contentType: string, articleTitle: string) => Promise<void>;
export declare function dispatchToBundler(dataAndTags: any, _contentType: string): Promise<string>;
