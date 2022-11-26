import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.method,
  description: `Used to pull user or mentions for twitter`,
  arg: '<user or mention>'
};

export default option;
