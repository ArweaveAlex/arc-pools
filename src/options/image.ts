import { OptionInterface } from "../interfaces";
import { CLI_ARGS } from "../config";

const option: OptionInterface = {
    name: CLI_ARGS.options.image,
    description: "Specifies an image to use in the pool creation background",
};

export default option;