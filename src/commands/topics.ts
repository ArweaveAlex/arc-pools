import fs from "fs";

import { PoolConfigType, PoolClient } from "arcframework";

import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { exitProcess, saveConfig } from "../helpers/utils";
import { log } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.topics,
    description: `Set the pool topics in pool state`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        const poolArg = args.commandValues[0];
        let topics = args.argv["topic-values"];
        if(!topics) {
            exitProcess('Please provide a --topic-values argument', 1);
        }
        let topicValues = topics.split(" ");
        poolConfig.walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let poolClient = new PoolClient({poolConfig});
        await poolClient.setTopics({topicValues});
        saveConfig(poolClient.poolConfig, poolArg);
        log('Topics saved', 0);
    }
}

export default command;