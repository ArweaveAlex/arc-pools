import fs from "fs";

import { PoolConfigType } from "../helpers/types";
import { validatePoolConfig } from "../helpers/validations";
import { ArgumentsInterface, CommandInterface } from "../helpers/interfaces";
import { CLI_ARGS, POOL_CONTRACT_PATH } from "../helpers/config";
import { ArweaveClient } from "../clients/arweave";
import { ArweaveSigner } from "warp-contracts-plugin-deploy";
import { log } from "../helpers/utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.evolve,
    description: "Evolve the pool contract",
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        const poolConfig: PoolConfigType = validatePoolConfig(args);
        let arClient = new ArweaveClient();
        let poolWalletJwk = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
        let poolWallet = new ArweaveSigner(poolWalletJwk);
        let poolSrc = fs.readFileSync(POOL_CONTRACT_PATH, "utf8");

        let contract = arClient.warp.contract(poolConfig.contracts.pool.id).connect(poolWalletJwk).setEvaluationOptions({
            allowBigInt: true
        });

        const newSource = await arClient.warp.createSource({src: poolSrc}, poolWallet);
        const newSrcId = await arClient.warp.saveSource(newSource);
        await contract.evolve(newSrcId);
        log('Contract evolved', 0);
    }
}
export default command;