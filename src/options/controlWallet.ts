import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.controlWallet,
	description: `Specifies a wallet to use in the pool creation`,
	arg: '<wallet file>',
};

export default option;
