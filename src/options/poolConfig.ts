import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.poolConfig,
  description: `Specifies the main pool configuration`,
};

export default option;
