import minimist from "minimist";
export interface ArgumentsInterface {
    argv: minimist.ParsedArgs;
    commandValues: string[];
}
export interface CommandInterface {
    name: string;
    execute: (args: ArgumentsInterface) => Promise<void>;
}
