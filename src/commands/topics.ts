import fs from 'fs';

import { PoolClient, PoolConfigType } from 'arcframework';

import { CLI_ARGS } from '../helpers/config';
import { ArgumentsInterface, CommandInterface } from '../helpers/interfaces';
import { exitProcess, log, saveConfig } from '../helpers/utils';
import { validatePoolConfig } from '../helpers/validations';

const command: CommandInterface = {
	name: CLI_ARGS.commands.topics,
	description: `Set the pool topics in pool state`,
	options: [
		{
			name: 'topic-values',
			description: 'Comma separated list of topics',
			arg: '<topics>',
		},
	],
	args: ['pool'],
	execute: async (args: ArgumentsInterface): Promise<void> => {
		const poolConfig: PoolConfigType = validatePoolConfig(args);
		const poolArg = args.commandValues[0];
		let topics = args.argv['topic-values'];
		if (!topics) {
			exitProcess('Please provide a --topic-values argument', 1);
		}
		let topicValues = topics.split(' ');
		poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
		let poolClient = new PoolClient({ poolConfig });
		await poolClient.setTopics({ topicValues });
		saveConfig(poolClient.poolConfig, poolArg);
		log('Topics saved', 0);
	},
};

export default command;
