import { IPoolClient, PoolClient, PoolConfigType } from 'arcframework';

import { CLI_ARGS } from '../../helpers/config';
import { ValidatedMinerType } from '../../helpers/types';
import { exitProcess, log, shuffleArray } from '../../helpers/utils';
import * as newsApi from '../news-api/miner';
import * as reddit from '../reddit/miner';
import * as wikipedia from '../wikipedia/miner';

export async function run(poolConfig: PoolConfigType) {
	const poolClient = new PoolClient({ poolConfig });

	log(`Mining all sources...`, 0);
	log(`Checking configurations...`, null);
	const validatedMiners: ValidatedMinerType[] = await getValidatedMiners(poolClient, poolConfig);
	if (!validatedMiners.length) exitProcess('No valid mining sources', 1);
	
	const runMiners = async (validatedMiners: ValidatedMinerType[]) => {
		await Promise.all(validatedMiners.map(async (miner: ValidatedMinerType) => {
			await miner.run();
		}));
	}

	runMiners(validatedMiners);
}

async function getValidatedMiners(
	poolClient: IPoolClient,
	poolConfig: PoolConfigType,
): Promise<ValidatedMinerType[]> {
	const validatedMiners: ValidatedMinerType[] = [];

	if (!poolConfig.topics || !poolConfig.topics.length) return validatedMiners;

	validatedMiners.push({
		source: CLI_ARGS.sources.wikipedia.name,
		status: true,
		run: () => wikipedia.run(poolConfig)
	});

	if (
		poolConfig.newsApiKey
	) {
		validatedMiners.push({
			source: CLI_ARGS.sources.newsApi.name,
			status: true,
			run: () => newsApi.run(poolConfig)
		});
	}

	if (
		poolConfig.redditApiKeys &&
		poolConfig.redditApiKeys.username &&
		poolConfig.redditApiKeys.password &&
		poolConfig.redditApiKeys.appId &&
		poolConfig.redditApiKeys.appSecret
	) {
		const keywords = shuffleArray(poolClient.poolConfig.keywords);
		validatedMiners.push({
			source: CLI_ARGS.sources.reddit.name,
			status: true,
			run: () => reddit.run(poolConfig, {
				_: ['mine', ''],
				source: 'reddit',
				method: 'search',
				'search-term': keywords
			})
		});
	}
	return validatedMiners;
}
