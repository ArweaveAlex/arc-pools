import { PoolClient, PoolConfigType } from 'arcframework';

import { exitProcess } from '../../helpers/utils';

import { processWikipedia } from '.';

export async function run(poolConfig: PoolConfigType) {
	const poolClient = new PoolClient({ poolConfig });

	await processWikipedia(poolClient);

	exitProcess(`Mining complete`, 0);
}
