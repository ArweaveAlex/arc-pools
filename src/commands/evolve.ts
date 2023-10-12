import { ArweaveClient, PoolClient, PoolConfigType } from 'arcframework';
import fs from 'fs';

import { CLI_ARGS } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { log } from '../helpers/utils';
import { validatePoolConfig } from '../helpers/validations';

const command: CommandInterface = {
	name: CLI_ARGS.commands.evolve,
	description: 'Evolve the pool contract',
	args: ['pool id'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);
		poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
		let signedWallet = new ArweaveClient().warpPluginArweaveSigner(poolConfig.walletKey);
		await new PoolClient({ poolConfig: poolConfig, signedPoolWallet: signedWallet }).evolve();
		log('Contract evolved', 0);
	},
};
export default command;
