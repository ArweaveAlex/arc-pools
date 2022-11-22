import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.method,
  description: `Specifies the mining method within a source`,
};

export default option;
