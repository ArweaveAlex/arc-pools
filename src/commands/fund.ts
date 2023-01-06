import fs from "fs";
import Bundlr from "@bundlr-network/client";

import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { ArweaveClient } from "../clients/arweave";

const command: CommandInterface = {
    name: CLI_ARGS.commands.fund,
    description: `Fun the bundlr wallet for a pool`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        let keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", keys);

        const arClient = new ArweaveClient();
        let balance  = await arClient.arweavePost.wallets.getBalance(poolConfig.state.owner.pubkey);

        try{
            await bundlr.fund(Math.floor(balance/2));
            console.log("Bundlr funded...")
        } catch (e: any){
            console.log(`Error funding bundlr, probably not enough funds in arweave wallet...\n ${e}`);
            throw new Error(e);
        }
    }
}

export default command;