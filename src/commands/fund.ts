import fs from "fs";
import Bundlr from "@bundlr-network/client";

import { ArweaveClient, PoolConfigType} from "arcframework";

import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS } from "../helpers/config";
import { exitProcess } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.fund,
    description: `Fund the bundlr wallet for a pool`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        let keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let bundlr = new Bundlr("https://node2.bundlr.network", "arweave", keys);

        const arClient = new ArweaveClient();
        let balance  = await arClient.arweavePost.wallets.getBalance(poolConfig.state.owner.pubkey);

        try{
            await bundlr.fund(Math.floor(balance/2));
            console.log("Bundlr funded ...")
        } catch (e: any){
            exitProcess(`Error funding bundlr, check funds in arweave wallet ...\n ${e}`, 1);
        }
    }
}

export default command;