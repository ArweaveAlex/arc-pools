import * as twitter from "../artifacts/miners/twitter/miner";
import * as wikipedia from "../artifacts/miners/wikipedia/miner";
import * as reddit from "../artifacts/miners/reddit/miner";
// import * as webpage from "../artifacts/miners/webpage/miner";
import * as nostr from "../artifacts/miners/nostr/miner";
import * as files from "../artifacts/miners/files/miner";

import source from "../options/source";
import method from "../options/method";

import { exitProcess } from "../helpers/utils";
import { PoolConfigType } from "arcframework";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";

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
            case CLI_ARGS.sources.reddit.name:
                await reddit.run(poolConfig, args.argv);
                return;
            // case CLI_ARGS.sources.webpage.name:
            //     await webpage.run(poolConfig, args.argv);
            //     return;
            case CLI_ARGS.sources.nostr.name:
                await nostr.run(poolConfig, args.argv);
                return;
            case CLI_ARGS.sources.files.name:
                await files.run(poolConfig, args.argv);
                return;
            default:
                exitProcess(`Source Not Found`, 1);
        }
    }
}

export default command;