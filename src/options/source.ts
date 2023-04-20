import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.source,
  description: `Specifies the data source`,
  arg: '<files / twitter / wikipedia / reddit / nostr>'
};

export default option;
