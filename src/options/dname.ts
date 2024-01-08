import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.dname,
	description: `Specifies the daemon name to stop`,
	arg: '<daemon>',
};

export default option;
