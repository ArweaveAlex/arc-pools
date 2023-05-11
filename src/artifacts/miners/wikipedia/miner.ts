import { PoolClient, PoolConfigType } from "arcframework";

import { exitProcess } from "../../../helpers/utils";
import { processWikipedia } from ".";

import { initCounter } from "../..";

export async function run(poolConfig: PoolConfigType) {
    const poolClient = new PoolClient(poolConfig);

    if (!poolConfig.walletKey) {
        exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    if (!poolClient.poolConfig.topics) {
        exitProcess(`Configure topics in pools.json`, 1);
    }

    initCounter();

    await processWikipedia(poolClient);

    exitProcess(`Mining complete`, 0);
}