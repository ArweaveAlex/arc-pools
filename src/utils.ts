import clc from "cli-color";

export function exitProcess(message: string, status: 0 | 1) {
    console.log(status === 0 ? clc.green(message) : clc.red(message));
    process.exit(status)
}