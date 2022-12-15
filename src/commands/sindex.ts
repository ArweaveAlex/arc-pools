import { PoolConfigType } from "../types";
import { validatePoolConfig } from "../validations";
import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS } from "../config";
import { indexPool } from "../search/indexBack";
import { ArweaveClient } from "../arweave-client";
import fs from 'fs';

const arClient = new ArweaveClient();

const command: CommandInterface = {
    name: CLI_ARGS.commands.sindex,
    description: `Index artifacts for searching`,
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);

        const WALLET_JSON = JSON.parse(fs.readFileSync("wallets/russia-ukraine.json").toString());

        const address = await arClient.arweavePost.wallets.jwkToAddress(WALLET_JSON);

        console.log(address);

        // indexPool(poolConfig);
    }
}

export default command;