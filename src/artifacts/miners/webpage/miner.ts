import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";


import { log, logValue, exitProcess } from "../../../helpers/utils";
import { PoolConfigType, IPoolClient } from "../../../helpers/types";
import { CLI_ARGS, STREAM_PARAMS } from "../../../helpers/config";
import { parseError } from "../../../helpers/errors";




export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining url");
}