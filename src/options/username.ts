import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.mentionTag,
  description: `Username for twitter or reddit with --method user`,
  arg: '<username>'
};

export default option;
