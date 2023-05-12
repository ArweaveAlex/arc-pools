import fs from "fs";
import { ArweaveSigner } from "warp-contracts-plugin-deploy";

import { 
    ArweaveClient, 
    PoolConfigType,
    PoolClient
} from "arcframework";

import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { log } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.evolve,
    description: "Evolve the pool contract",
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        await (new PoolClient(poolConfig)).evolve();
        log('Contract evolved', 0);
    }
}
export default command;