import fs from "fs";

import { exitProcess } from "./utils";
import { CLI_ARGS } from "./config";
import { PoolConfigType } from "./types";
import { ArgumentsInterface } from "./interfaces";

export function validatePoolConfig(args: ArgumentsInterface): PoolConfigType {
    if (!args.commandValues || !args.commandValues.length) {
        exitProcess(`Pool Not Provided`, 1);
    }

    console.log(args.argv)
    if (!args.argv["pool-conf"]) {
        exitProcess(`Pool Config Not Provided`, 1);
    }

    const poolArg = args.commandValues[0];
    const poolConfigArg = args.argv["pool-conf"];
    const POOLS_JSON = JSON.parse(fs.readFileSync(poolConfigArg).toString());

    if (!(poolArg in POOLS_JSON)) {
        exitProcess(`Pool Not Found`, 1);
    }

    // TODO - validate JSON

    return POOLS_JSON[poolArg];
}