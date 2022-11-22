import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.dname,
  description: `Specifies the daemon name to stop`,
};

export default option;
