import { PoolSearchIndexType, PoolType } from '../helpers/types';
export declare function getPoolById(poolId: string): Promise<PoolType | null>;
export declare function getLatestPoolSearchIndexTxId(poolId: string): Promise<import("../helpers/types").GQLResponseType>;
export declare function getPoolSearchIndexById(poolSearchIndexId: string): Promise<PoolSearchIndexType | null>;
export declare function getPoolCount(nftContractSrc: string): Promise<number>;
