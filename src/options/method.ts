import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.method,
	description: `Subcategory within source such as user`,
	arg: '<user / mention / subreddit / search>',
};

export default option;
