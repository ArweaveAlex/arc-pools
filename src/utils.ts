import clc from "cli-color";

export function exitProcess(message: string) {
    console.log(clc.red(message));
    process.exit(1)
}