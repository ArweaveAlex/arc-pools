import { TurboFactory } from '@ardrive/turbo-sdk';
import fs from 'fs';

import { ArweaveClient, PoolConfigType } from 'arcframework';

import { CLI_ARGS } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { getARAmountFromWinc } from '../helpers/utils';
import { validatePoolConfig } from '../helpers/validations';

const command: CommandInterface = {
	name: CLI_ARGS.commands.balance,
	description: `Check the Arweave and Turbo balance for the pool wallet`,
	args: ['pool'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);
		const wallet = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());

		const turbo = TurboFactory.authenticated({ privateKey: wallet });
		const arClient = new ArweaveClient(wallet);

		let arBalance: number = 0;
		let turboBalance: number = 0;

		try {
			arBalance = await arClient.arweavePost.wallets.getBalance(poolConfig.state.owner.pubkey);
			turboBalance = Number((await turbo.getBalance()).winc);
		} catch (e: any) {
			console.error(e);
		}

		console.log(`Arweave balance: ${getARAmountFromWinc(arBalance)} AR`);
		console.log(`Turbo balance: ${getARAmountFromWinc(turboBalance)} Credits`);
	},
};

export default command;
