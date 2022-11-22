import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.mentionTag,
  description: `Specifies the username for --source twitter --method user (do not include '@' handle)`,
};

export default option;
