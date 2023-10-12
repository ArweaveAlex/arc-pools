import { IPoolClient, PoolClient, PoolConfigType } from 'arcframework';
import minimist from 'minimist';

import { ServiceClient } from '../../clients/service';
import { CLI_ARGS } from '../../helpers/config';
import { ValidatedMinerType } from '../../helpers/types';
import { exitProcess, log } from '../../helpers/utils';
import { checkTwitterAccess } from '../twitter/miner';

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
	const poolClient = new PoolClient({ poolConfig });
	const serviceClient: ServiceClient = new ServiceClient(poolConfig);

	log(`Mining all sources ...`, 0);
	log(`Checking configurations ...`, null);
	const validatedMiners: ValidatedMinerType[] = await getValidatedMiners(poolClient, poolConfig, serviceClient);
	if (!validatedMiners.length) exitProcess('No valid mining sources', 1);
	// validatedMiners.forEach((miner: ValidatedMinerType) => {
	// 	log(`Miner: ${JSON.stringify(miner, null, 2)}`, null);
	// });
}

async function getValidatedMiners(
	poolClient: IPoolClient,
	poolConfig: PoolConfigType,
	serviceClient: ServiceClient
): Promise<ValidatedMinerType[]> {
	const validatedMiners: ValidatedMinerType[] = [];

	if (!poolConfig.topics || !poolConfig.topics.length) return validatedMiners;

	const successMessage = 'success';
	const failedMessage = 'failed';

	validatedMiners.push({
		source: CLI_ARGS.sources.wikipedia.name,
		status: true,
		message: successMessage,
	});

	if (
		poolConfig.redditApiKeys &&
		poolConfig.redditApiKeys.username &&
		poolConfig.redditApiKeys.password &&
		poolConfig.redditApiKeys.appId &&
		poolConfig.redditApiKeys.appSecret
	) {
		validatedMiners.push({
			source: CLI_ARGS.sources.reddit.name,
			status: true,
			message: successMessage,
		});
	}

	if (
		poolConfig.twitterApiKeys &&
		poolConfig.twitterApiKeys.consumer_key &&
		poolConfig.twitterApiKeys.consumer_secret &&
		poolConfig.twitterApiKeys.token &&
		poolConfig.twitterApiKeys.token_secret &&
		poolConfig.twitterApiKeys.bearer_token
	) {
		const twitterCheck = await checkTwitterAccess(poolClient, serviceClient);
		validatedMiners.push({
			source: CLI_ARGS.sources.twitter.name,
			status: twitterCheck,
			message: twitterCheck ? successMessage : failedMessage,
		});
	}

	return validatedMiners;
}
