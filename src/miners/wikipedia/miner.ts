import { PoolClient, PoolConfigType } from 'arcframework';

import { log } from '../../helpers/utils';

import { processWikipedia } from '.';

export async function run(poolConfig: PoolConfigType) {
	const poolClient = new PoolClient({ poolConfig });

	log(`Mining Wikipedia...`, 0);

	await processWikipedia(poolClient);

	log(`Wikipedia Mining Complete`, 0);
}
