import { OptionInterface } from "../config/interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.source,
  description: `Specifies the data source`,
  arg: '<twitter or wikipedia>'
};

export default option;
