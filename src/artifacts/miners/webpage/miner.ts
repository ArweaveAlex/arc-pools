import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";


import { exitProcess } from "../../../helpers/utils";
import { PoolConfigType } from "../../../helpers/types";




export async function run(poolConfig: PoolConfigType, _argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining url");
}