import fs from "fs";
import Bundlr from "@bundlr-network/client";

import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { ArweaveClient } from "../clients/arweave";

const command: CommandInterface = {
    name: CLI_ARGS.commands.balance,
    description: `Check the Bundlr and Arweave balance for the pool wallet`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        let keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", keys);

        const arClient = new ArweaveClient();
        let balance  = await arClient.arweavePost.wallets.getBalance(poolConfig.state.owner.pubkey);
        let bundlrBalance = await bundlr.getBalance(poolConfig.state.owner.pubkey);
        

        console.log(`Arweave balance: ${balance}`);
        console.log(`Bundlr balance: ${bundlrBalance}`);
    }
}

export default command;