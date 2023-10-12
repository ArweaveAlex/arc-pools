import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.topicValues,
	description: 'Comma seperated list of topics',
	arg: '<comma seperated list of topics>',
};

export default option;
