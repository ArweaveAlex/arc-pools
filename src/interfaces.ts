import minimist from "minimist";

export interface ArgumentsInterface {
    argv: minimist.ParsedArgs;
    commandValues: string[];
}

export interface CommandInterface {
  name: string;
//   aliases?: string[];
//   options?: OptionInterface[];
//   args?: string[];
//   usage?: string[];
//   description: string;
  execute: (args: ArgumentsInterface) => Promise<void>;
}
