import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.mentionTag,
  description: `Username for twitter with --method user (do not include '@')`,
  arg: '<twitter username>'
};

export default option;
