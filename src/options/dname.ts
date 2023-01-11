import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.dname,
  description: `Specifies the daemon name to stop`,
  arg: '<string>'
};

export default option;
