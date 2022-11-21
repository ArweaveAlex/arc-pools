import clc from "cli-color";
import figlet from "figlet";

import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { APP_TITLE, CLI_ARGS } from "../config";

const command: CommandInterface = {
    name: CLI_ARGS.help,
    execute: async (args: ArgumentsInterface): Promise<void> => {
        console.log(clc.magenta(figlet.textSync(APP_TITLE)));
    }
}

export default command;