import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
    name: CLI_ARGS.options.fileConfig,
    description: "Specifies a path to a file metadata json config",
    arg: '<path to metadata config>'
};

export default option;