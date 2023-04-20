import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
    name: CLI_ARGS.options.clear,
    description: "Clear local files used on command",
    arg: ''
};

export default option;