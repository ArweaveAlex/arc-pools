import clc from 'cli-color';
import fs from 'fs';
import mime from 'mime';
import path from 'path';

const readline = require('readline');

import { ArweaveClient, PoolClient, PoolConfigClient, PoolConfigType, PoolCreateClient, sonarLink } from 'arcframework';

import { CLI_ARGS, POOL_FILE, POOL_TEST_MODE } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { exitProcess, log } from '../helpers/utils';
import { validateControlWalletPath, validatePoolConfig } from '../helpers/validations';
import { createWallet } from '../helpers/wallet';

const command: CommandInterface = {
	name: CLI_ARGS.commands.create,
	description: `Create a pool using ${POOL_FILE}`,
	options: [
		{
			name: 'control-wallet',
			description: 'Specifies a wallet to use in the pool creation',
			arg: '<wallet-path>',
		},
		{
			name: 'image',
			description: 'Specifies an image to use for pool',
			arg: '<image-path>',
		},
	],
	args: ['pool'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);
		const poolConfigClient: PoolConfigClient = new PoolConfigClient({ testMode: POOL_TEST_MODE });
		const arClient = new ArweaveClient();
		const controlWalletPath: string = validateControlWalletPath(args.argv['control-wallet']);
		const poolPath: string = POOL_FILE;
		const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());
		const poolArg = args.commandValues[0];
		const pConfig: PoolConfigType = POOLS_JSON[poolArg];
		let controlWalletJwk: any;
		let image: Buffer = null;
		let imageType: string = null;
		let poolCreateClient: PoolCreateClient;
		let controlWalletAddress: string;
		let walletInfo: any;
		let newConfig: any;
		let answer1: string;
		let answer2: string;

		try {
			await poolConfigClient.validateNewPoolConfig({ poolConfig });

			controlWalletJwk = JSON.parse(fs.readFileSync(controlWalletPath).toString());
			controlWalletAddress = await arClient.arweavePost.wallets.jwkToAddress(controlWalletJwk);

			while (true) {
				answer1 = await askQuestion(
					'Would you like to use your control wallet as the wallet which will receive pool contributions? If you answer no this program will generate another wallet for the pool. (y/n) '
				);

				log(answer1, 0);

				if (answer1.toLowerCase() === 'y') {
					walletInfo = {
						file: controlWalletPath,
						address: controlWalletAddress,
						keys: controlWalletJwk,
					};
					break;
				} else if (answer1.toLowerCase() === 'n') {
					walletInfo = await createWallet(poolArg);
					break;
				} else {
					log('Please enter y or n', 0);
				}
			}

			while (true) {
				answer2 = await askQuestion(
					'Would you like the artifacts in this pool to be tradeable ? Tradeable artifacts can be listed and bought for sale through the UCM. (y/n) '
				);

				log(answer2, 0);

				if (answer2.toLowerCase() === 'y') {
					pConfig.tradeable = true;
					break;
				} else if (answer2.toLowerCase() === 'n') {
					pConfig.tradeable = false;
					break;
				} else {
					log('Please enter y or n', 0);
				}
			}

			if (args.argv['image']) {
				if (!fs.existsSync(args.argv['image'])) {
					throw new Error(`Image file does not exist`);
				}
				image = await fs.promises.readFile(path.resolve(args.argv['image']));
				imageType = mime.getType(args.argv['image']);
			}

			let signedWallet = new ArweaveClient().warpPluginArweaveSigner(controlWalletJwk);
			pConfig.state.owner.pubkey = walletInfo.address;

			poolCreateClient = new PoolCreateClient({
				poolConfig: pConfig,
				controlWalletJwk: controlWalletJwk,
				controlWalletAddress: controlWalletAddress,
				signedControlWallet: signedWallet,
				poolWalletPath: walletInfo.file,
				img: image,
				imgFileType: imageType,
			});

			newConfig = await poolCreateClient.createPool();

			POOLS_JSON[poolArg] = newConfig;
			fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
			console.log(`Pool File Updated`);
		} catch (e: any) {
			exitProcess(`${e}`, 1);
		}

		log(
			`Your pool has been deployed, please wait for the pool to display correctly from the below link before proceeding...`,
			0
		);
		log(clc.magenta(sonarLink(newConfig.contracts.pool.id)), 0);
	},
};

function askQuestion(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer: string) => {
			rl.close();
			resolve(answer);
		});
	});
}

export default command;
