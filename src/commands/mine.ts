import * as twitter from "../artifacts/miners/twitter/miner";
import * as wikipedia from "../artifacts/miners/wikipedia/miner";

import source from "../options/source";
import method from "../options/method";

import { exitProcess } from "../helpers/utils";
import { PoolConfigType } from "../helpers/types";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

// TODO - run all validations here
// TODO - pass poolClient: IPoolClient instead of poolConfig
const command: CommandInterface = {
    name: CLI_ARGS.commands.mine,
    description: `Mine artifacts for a given pool`,
    options: [source, method],
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        
        const { source } = args.argv;
        if (!source) {
            exitProcess(`No Source Provided`, 1);
        }

        switch (source) {
            case CLI_ARGS.sources.twitter.name:
                await twitter.run(poolConfig, args.argv);
                return;
            case CLI_ARGS.sources.wikipedia.name:
                await wikipedia.run(poolConfig);
                return;
            default:
                exitProcess(`Source Not Found`, 1);
        }
    }
}

export default command;