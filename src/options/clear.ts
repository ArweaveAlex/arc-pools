import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
    name: CLI_ARGS.options.clear,
    description: "Clear local search index for pool",
    arg: ''
};

export default option;