import fs from 'fs';

import { PoolConfigType } from 'arcframework';

import { POOL_FILE } from './config';
import { ArgumentsInterface } from './interfaces';
import { exitProcess } from './utils';

export function validatePoolConfig(args: ArgumentsInterface): PoolConfigType {
	if (!args.commandValues || !args.commandValues.length) {
		exitProcess(`Pool not provided`, 1);
	}

	if (!fs.existsSync(POOL_FILE)) {
		exitProcess(`${POOL_FILE} does not exist`, 1);
	}

	const poolArg = args.commandValues[0];
	const POOLS_JSON = JSON.parse(fs.readFileSync(POOL_FILE).toString());

	if (!(poolArg in POOLS_JSON)) {
		exitProcess(`Pool Not Found`, 1);
	}

	let poolConfig = POOLS_JSON[poolArg];

	try {
		poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
	} catch (_e: any) {}

	return poolConfig;
}

export function validateControlWalletPath(path: string): string {
	if (!path || typeof path === 'boolean') {
		exitProcess(`Control wallet path not provided`, 1);
	}

	if (!fs.existsSync(path)) {
		exitProcess(`${path} does not exist`, 1);
	}

	return path;
}
