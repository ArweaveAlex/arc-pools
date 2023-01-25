import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.method,
  description: `Subcategory within source such as user`,
  arg: '<user, mention, subreddit, posts>'
};

export default option;
