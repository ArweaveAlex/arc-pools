import fs from 'fs';

import { PoolConfigType } from 'arcframework';

import { CLI_ARGS } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { exitProcess } from '../helpers/utils';
import { validatePoolConfig } from '../helpers/validations';
import * as all from '../miners/all/miner';
import * as files from '../miners/files/miner';
import * as gnews from '../miners/news/gnews/miner';
import * as newsApi from '../miners/news/news-api/miner';
import * as nostr from '../miners/nostr/miner';
import * as reddit from '../miners/reddit/miner';
import * as twitter from '../miners/twitter/miner';
import * as wikipedia from '../miners/wikipedia/miner';
import source from '../options/source';

const command: CommandInterface = {
	name: CLI_ARGS.commands.mine,
	description: `Mine artifacts for a given pool`,
	options: [
		source,
		{
			name: 'd',
			arg: '',
			description: 'Run the miner as a daemon process',
		},
	],
	args: ['pool'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);

		const { source } = args.argv;
		if (!source) {
			exitProcess(`No source provided`, 1);
		}

		if (!poolConfig.walletKey || !poolConfig.walletPath) {
			exitProcess(`Invalid pool wallet configuration`, 1);
		}

		if (!fs.existsSync(poolConfig.walletPath)) {
			exitProcess(`Pool wallet path not found, update path in pools.json (walletPath)`, 1);
		}

		if (!poolConfig.topics || !poolConfig.topics.length) {
			exitProcess(`Configure topics in pools.json`, 1);
		}

		if (!poolConfig.keywords || !poolConfig.keywords.length) {
			exitProcess(`Configure keywords in pools.json`, 1);
		}

		switch (source) {
			case CLI_ARGS.sources.twitter.name:
				await twitter.run(poolConfig, args.argv);
				return;
			case CLI_ARGS.sources.wikipedia.name:
				await wikipedia.run(poolConfig);
				return;
			case CLI_ARGS.sources.reddit.name:
				await reddit.run(poolConfig, args.argv);
				return;
			case CLI_ARGS.sources.nostr.name:
				await nostr.run(poolConfig, args.argv);
				return;
			case CLI_ARGS.sources.files.name:
				await files.run(poolConfig, args.argv);
				return;
			case CLI_ARGS.sources.newsApi.name:
				await newsApi.run(poolConfig);
				return;
			case CLI_ARGS.sources.gnews.name:
				await gnews.run(poolConfig);
				return;
			case CLI_ARGS.sources.all.name:
				await all.run(poolConfig);
				return;
			default:
				exitProcess(`Source Not Found`, 1);
		}
	},
};

export default command;
