import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.subreddit,
  description: `Subreddit to mine`,
  arg: '<subreddit>'
};

export default option;
