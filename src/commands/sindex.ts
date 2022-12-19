import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { 
    fetchPool,
    indexPool 
} from "../search/index";
import { ArweaveClient } from "../arweave-client";
import fs from 'fs';

const arClient = new ArweaveClient();

const command: CommandInterface = {
    name: CLI_ARGS.commands.sindex,
    description: `Index artifacts for searching`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        // fetchPool(poolConfig);
        indexPool(
            poolConfig,
            args
        );
    }
}

export default command;