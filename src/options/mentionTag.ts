import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.mentionTag,
  description: `Specifies the mention tag for --source twitter --method mention (pass in single quotes for multiple tags i.e. '@AlexArchive #history')`,
};

export default option;
