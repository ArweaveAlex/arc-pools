import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.mentionTag,
	description: `Mention tag to mine, example '@AlexArchive #history'`,
	arg: '<string in quotes>',
};

export default option;
