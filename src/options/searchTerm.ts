import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.searchTerm,
	description: `Search term to mine`,
	arg: '<search term>',
};

export default option;
