import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
    name: CLI_ARGS.options.fileDir,
    description: "Specifies a directory to pull files from",
    arg: '<path to file directory>'
};

export default option;