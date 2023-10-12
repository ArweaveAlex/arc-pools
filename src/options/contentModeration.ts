import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.contentModeration,
	description: `Use content moderation on twitter mining`,
	arg: '',
};

export default option;
