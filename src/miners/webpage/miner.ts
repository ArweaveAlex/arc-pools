import { PoolClient, PoolConfigType } from 'arcframework';
import minimist from 'minimist';

import { exitProcess } from '../../helpers/utils';

export async function run(poolConfig: PoolConfigType, _argv: minimist.ParsedArgs) {
	const poolClient = new PoolClient({ poolConfig });

	console.log('Mining url');
}
