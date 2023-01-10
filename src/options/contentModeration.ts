import { OptionInterface } from "../config/interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.contentModeration,
  description: `Use content moderation on twitter mining`,
  arg: ''
};

export default option;
