import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.source,
	description: `Specifies the data source`,
	arg: '<files / twitter / wikipedia / reddit / news-api / nostr>',
};

export default option;
