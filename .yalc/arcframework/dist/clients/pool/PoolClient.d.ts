import { ContributionResultType, ContributionType, IPoolClient, PoolConfigType, PoolType } from '../../helpers/types';
import { ArweaveClient } from '../arweave';
import { Contract } from 'warp-contracts';
export default class PoolClient extends ArweaveClient implements IPoolClient {
    arClient: ArweaveClient;
    poolConfig: PoolConfigType;
    walletKey: string | null;
    contract: Contract;
    constructor(poolConfig: PoolConfigType);
    validatePoolConfigs(): Promise<void>;
    getUserContributions(userWallet: string): Promise<any[]>;
    calcARDonated(userWallet: string, pool: PoolType): string;
    calcReceivingPercent(userWallet: string, pool: PoolType): string | 0;
    calcLastContributions(userWallet: string, pools: PoolType[]): Promise<any>;
    getReceivingPercent(userWallet: string, contributors: any, totalContributions: string, activeAmount: number): string;
    calcContributions(contributions: string | ContributionType[]): string;
    getARAmount(amount: string): number;
    handlePoolContribute(poolId: string, amount: number, availableBalance: number): Promise<ContributionResultType>;
}
