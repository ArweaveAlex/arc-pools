import fs from "fs";
import Bundlr from "@bundlr-network/client";

import { PoolConfigType } from "arcframework";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { ArweaveClient } from "arcframework";

const command: CommandInterface = {
    name: CLI_ARGS.commands.balance,
    description: `Check the Bundlr and Arweave balance for the pool wallet`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        let keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let bundlr = new Bundlr("https://node2.bundlr.network", "arweave", keys);

        const arClient = new ArweaveClient();
        let balance  = await arClient.arweavePost.wallets.getBalance(poolConfig.state.owner.pubkey);
        let bundlrBalance = await bundlr.getBalance(poolConfig.state.owner.pubkey);
        

        console.log(`Arweave balance: ${balance}`);
        console.log(`Bundlr balance: ${bundlrBalance}`);
    }
}

export default command;