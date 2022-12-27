import clc from "cli-color";

import { STORAGE } from "./config";
import { KeyValueType } from "./types";

export function exitProcess(message: string, status: 0 | 1) {
    console.log(status === 0 ? clc.green(message) : clc.red(message));
    process.exit(status)
}

export function displayJsonUpdate(poolTitle: string, key: string, value: string) {
    console.log(`Updating ${poolTitle} JSON Object - ${key} - [`, clc.green(`'${value}'`), `]`);
}

export function getTagValue(list: KeyValueType[], name: string): string {
    for (let i = 0; i < list.length; i++) {
        if (list[i]) {
            if (list[i]!.name === name) {
                return list[i]!.value as string;
            }
        }
    }
    return STORAGE.none;
}

export function unquoteJsonKeys(json: Object): string {
    return JSON.stringify(json).replace(/"([^"]+)":/g, '$1:')
}

export function getTxEndpoint(txId: string) {
    return `https://arweave.net/${txId}`;
}

export function getRedstoneEndpoint(nftSrc: string, page: number) {
    return `https://gateway.redstone.finance/gateway/contracts-by-source?id=${nftSrc}&page=${page}`;
}
