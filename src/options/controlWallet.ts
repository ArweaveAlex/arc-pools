import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
  name: CLI_ARGS.options.controlWallet,
  description: `Specifies a wallet to use in the pool creation`,
  arg: '<wallet file>'
};

export default option;
