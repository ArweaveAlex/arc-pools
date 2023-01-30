import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.searchTerm,
  description: `Search term to mine`,
  arg: '<search term>'
};

export default option;
