import { OptionInterface } from "../config/interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.dname,
  description: `Specifies the daemon name to stop`,
  arg: '<string>'
};

export default option;
