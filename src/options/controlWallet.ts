import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
  name: CLI_ARGS.options.controlWallet,
  description: `Specifies a control wallet to use in the pool creation transactions`,
};

export default option;
