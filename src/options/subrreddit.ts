import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.subreddit,
	description: `Subreddit to mine`,
	arg: '<subreddit>',
};

export default option;
