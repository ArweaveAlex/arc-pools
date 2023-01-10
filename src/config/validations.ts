import fs from "fs";

import { exitProcess } from "./utils";
import { POOL_FILE } from ".";
import { PoolConfigType } from "./types";
import { ArgumentsInterface } from "./interfaces";

export function validatePoolConfig(args: ArgumentsInterface): PoolConfigType {
    if (!args.commandValues || !args.commandValues.length) {
        exitProcess(`Pool not provided`, 1);
    }

    if (!fs.existsSync(POOL_FILE)) {
        exitProcess(`${POOL_FILE} does not exist`, 1);
    }

    const poolArg = args.commandValues[0];
    const POOLS_JSON = JSON.parse(fs.readFileSync(POOL_FILE).toString());

    if (!(poolArg in POOLS_JSON)) {
        exitProcess(`Pool Not Found`, 1);
    }

    return POOLS_JSON[poolArg];
}

export function validateControlWalletPath(path: string): string {
    if (!path || typeof path === "boolean") {
        exitProcess(`Control wallet path not provided`, 1);
    }

    if (!fs.existsSync(path)) {
        exitProcess(`${path} does not exist`, 1);
    }

    return path;
}