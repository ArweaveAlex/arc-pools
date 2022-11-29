import clc from "cli-color";

export function exitProcess(message: string, status: 0 | 1) {
    console.log(status === 0 ? clc.green(message) : clc.red(message));
    process.exit(status)
}

export function displayJsonUpdate(poolTitle: string, key: string, value: string) {
    console.log(`Updating ${poolTitle} JSON Object - ${key} - [`, clc.green(`'${value}'`), `]`);
}