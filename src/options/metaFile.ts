import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.metaFile,
	description: 'Specifies a metadata config for file uploads',
	arg: '<path to metadata file>',
};

export default option;
