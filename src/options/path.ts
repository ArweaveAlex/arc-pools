import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.path,
	description: 'Specifies a directory or file to upload',
	arg: '<path to file or directory>',
};

export default option;
