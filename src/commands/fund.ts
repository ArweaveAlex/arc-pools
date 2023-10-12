import { PoolClient, PoolConfigType } from 'arcframework';
import fs from 'fs';

import { CLI_ARGS } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { log } from '../helpers/utils';
import { validatePoolConfig } from '../helpers/validations';

const command: CommandInterface = {
	name: CLI_ARGS.commands.fund,
	description: `Fund the bundlr wallet for a pool`,
	args: ['pool id'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);
		poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
		let poolClient = new PoolClient({ poolConfig });
		console.log(poolClient);
		await poolClient.arClient.bundlr.ready();
		let balances = await poolClient.balances();
		console.log(balances.poolBalance);
		if (balances.poolBalance > 0) {
			await poolClient.fundBundlr(balances.poolBalance.toString());
			log('Bundlr funded', 0);
		} else {
			log('No funds to send to Bundlr', 0);
		}
	},
};

export default command;
