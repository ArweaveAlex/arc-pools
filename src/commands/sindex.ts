import { PoolConfigType } from "../helpers/types";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { 
    indexPool 
} from "../search/index";
import { ArweaveClient } from "../clients/arweave";

const arClient = new ArweaveClient();

const command: CommandInterface = {
    name: CLI_ARGS.commands.sindex,
    description: `Index artifacts for search`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        indexPool(
            poolConfig,
            args
        );
    }
}

export default command;