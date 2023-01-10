import { OptionInterface } from "../config/interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.mentionTag,
  description: `Mention tag to mine, example '@AlexArchive #history'`,
  arg: '<string in quotes>'
};

export default option;
