import minimist from "minimist";
import CommandInterface from "./interfaces/command";

export interface ArgumentsInterface {
  argv: minimist.ParsedArgs;
  commandValues: string[];
  options: Map<string, OptionInterface>;
  commands: Map<string, CommandInterface>
}

export interface OptionInterface {
  name: string;
  description: string;
  arg: string
}

// export interface CommandInterface {
//   name: string;
//   options?: OptionInterface[];
//   execute: (args: ArgumentsInterface) => Promise<void>;
// }