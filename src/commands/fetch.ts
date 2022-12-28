import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { 
    fetchPool,
    clearLocalIndex
} from "../search/index";
import { ArweaveClient } from "../arweave-client";
import clear from "../options/clear";

const command: CommandInterface = {
    name: CLI_ARGS.commands.fetch,
    description: `Fetch pool artifacts for search`,
    args: ["pool id"],
    options: [clear],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);

        const { clear } = args.argv;

        if(clear == true) {
            await clearLocalIndex(poolConfig);
        }

        fetchPool(poolConfig);
    }
}

export default command;