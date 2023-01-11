import { PoolConfigType } from "../helpers/types";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { 
    fetchPool,
    clearLocalIndex
} from "../search/index";
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