import { OptionInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

const option: OptionInterface = {
    name: CLI_ARGS.options.image,
    description: "Specifies an image to use for pool",
    arg: '<path to image file>'
};

export default option;