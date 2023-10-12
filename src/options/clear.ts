import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.clear,
	description: 'Clear local files used on command',
	arg: '',
};

export default option;
