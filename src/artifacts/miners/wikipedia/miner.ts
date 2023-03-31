import { PoolClient } from "../../../clients/pool";

import { exitProcess } from "../../../helpers/utils";
import { PoolConfigType } from "../../../helpers/types";
import { processWikipedia } from ".";

import { initCounter } from "../..";

export async function run(poolConfig: PoolConfigType) {
    const poolClient = new PoolClient(poolConfig);

    if (!poolClient.walletKey) {
        exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    if (!poolClient.poolConfig.topics) {
        exitProcess(`Configure topics in pools.json`, 1);
    }

    initCounter();

    await processWikipedia(poolClient);

    exitProcess(`Mining complete`, 0);
}