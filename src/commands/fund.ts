import fs from "fs";

import { ArweaveClient, PoolClient, PoolConfigType} from "arcframework";

import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { exitProcess, log } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.fund,
    description: `Fund the bundlr wallet for a pool`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        await (new PoolClient(poolConfig)).fundBundlr();
        log('Bundlr funded', 0);
    }
}

export default command;