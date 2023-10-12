import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.mentionTag,
	description: `Username for twitter or reddit with --method user`,
	arg: '<username>',
};

export default option;
