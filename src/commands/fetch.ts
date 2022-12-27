import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { 
    fetchPool
} from "../search/index";
import { ArweaveClient } from "../arweave-client";

const arClient = new ArweaveClient();

const command: CommandInterface = {
    name: CLI_ARGS.commands.fetch,
    description: `Fetch pool artifacts for search`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        fetchPool(poolConfig);
    }
}

export default command;