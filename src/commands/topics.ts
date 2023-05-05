import fs from "fs";

import { PoolConfigType, ANSTopicEnum } from "../helpers/types";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { ArweaveClient } from "../clients/arweave";
import { exitProcess, saveConfig } from "../helpers/utils";
import { log } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.topics,
    description: `Set the pool topics in pool state`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        const poolArg = args.commandValues[0];
        let poolWalletJwk = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let arClient = new ArweaveClient();
        let topics = args.argv["topic-values"];

        if(!topics) {
            exitProcess('Please provide a --topic-values argument', 1);
        }
        let topicValues = topics.split(" ");
        for (let i = 0; i < topicValues.length; i++) {
            let topicValue = topicValues[i].trim().toLowerCase();
            if (!Object.keys(ANSTopicEnum).some(key => ANSTopicEnum[key].toLowerCase() === topicValue)) {
                exitProcess(`Invalid topic value: ${topicValue}, please only use values from this list - ${Object.values(ANSTopicEnum).join(", ")}`, 1);
            }
        }

        topicValues = topicValues.map((val: string) => {
            let l = val.toLowerCase();
            return l.charAt(0).toUpperCase() + l.slice(1);
        });

        let contract = arClient.warp.contract(poolConfig.contracts.pool.id).connect(poolWalletJwk).setEvaluationOptions({
            allowBigInt: true
        });

        await contract.writeInteraction({
            function: "setTopics",
            data: topicValues
        });

        poolConfig.topics = topicValues;
        saveConfig(poolConfig, poolArg);
        log('Topics saved', 0);
    }
}

export default command;