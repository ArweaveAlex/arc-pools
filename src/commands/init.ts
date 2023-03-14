import fs from "fs";

import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS, DEFAULT_POOLS_JSON, POOL_FILE } from "../helpers/config";
import { exitProcess } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.init,
    description: `Initialize ${POOL_FILE}`,
    options: [],
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        if (!args.commandValues || !args.commandValues.length) {
            exitProcess(`Pool id Not Provided`, 1);
        }

        if(!fs.existsSync(POOL_FILE)){
            fs.writeFileSync(POOL_FILE, JSON.stringify({}, null, 4));
        }

        const poolArg = args.commandValues[0];
        const poolJsonFile = JSON.parse(fs.readFileSync(POOL_FILE).toString());

        if(poolJsonFile.hasOwnProperty(poolArg)){
            exitProcess(`Pool id already exists`, 1);
        }

        poolJsonFile[poolArg] = DEFAULT_POOLS_JSON;

        fs.writeFileSync(POOL_FILE, JSON.stringify(poolJsonFile, null, 4));

        console.log("Pool initialized in " + POOL_FILE)
    }
}

export default command;