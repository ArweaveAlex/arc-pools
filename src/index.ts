import fs from "fs";
import clc from "cli-color";
import path from "path";
import minimist from "minimist";

import { ArgumentsInterface, CommandInterface, OptionInterface } from "./interfaces";
import { APP_TITLE, CLI_ARGS } from "./config";

(async function () {
    const argv = minimist(process.argv.slice(2));
    let command = argv._[0];
    const commandValues = argv._.slice(1);

    const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith('.ts'));
    const commands: Map<string, CommandInterface> = new Map();
    for (const file of commandFiles) {
        const filePath = path.join(__dirname, "commands", file);
        const { default: command } = require(filePath);
        commands.set(command.name, command);
    }

    const optionFiles = fs.readdirSync(path.join(__dirname, "options")).filter((file) => file.endsWith('.ts'));
    const options: Map<string, OptionInterface> = new Map();

    for (const file of optionFiles) {
      const filePath = path.join(__dirname, "options", file);

      const { default: option } = require(filePath);
      options.set(option.name, option);
    }

    const args: ArgumentsInterface = {
        argv: argv,
        commandValues: commandValues,
        options: options
    }

    if (commands.has(command)) {
        await commands.get(command).execute(args);   
    }
    else {
        console.log(clc.red(command ? 
            `Command not found: ${command}` : `No command provided`), 
            `\nRun '${APP_TITLE} ${CLI_ARGS.commands.help}' for app usage`);
    }
})();