import minimist from "minimist";

import { PoolClient, PoolConfigType } from "arcframework";


import { exitProcess } from "../../helpers/utils";




export async function run(poolConfig: PoolConfigType, _argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient({poolConfig});
  
    if (!poolConfig.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining url");
}