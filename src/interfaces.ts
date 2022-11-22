import minimist from "minimist";

export interface ArgumentsInterface {
  argv: minimist.ParsedArgs;
  commandValues: string[];
  options: Map<string, OptionInterface>;
}

export interface OptionInterface {
  name: string;
  description: string;
}

// export interface CommandInterface {
//   name: string;
//   options?: OptionInterface[];
//   execute: (args: ArgumentsInterface) => Promise<void>;
// }