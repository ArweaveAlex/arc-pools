"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const cli_color_1 = __importDefault(require("cli-color"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
const config_1 = require("./config");
(async function () {
    const argv = (0, minimist_1.default)(process.argv.slice(2));
    let command = argv._[0];
    const commandValues = argv._.slice(1);
    const commandFiles = fs_1.default.readdirSync(path_1.default.join(__dirname, "commands")).filter((file) => file.endsWith('.ts'));
    const commands = new Map();
    for (const file of commandFiles) {
        const filePath = path_1.default.join(__dirname, "commands", file);
        const { default: command } = require(filePath);
        commands.set(command.name, command);
    }
    const optionFiles = fs_1.default.readdirSync(path_1.default.join(__dirname, "options")).filter((file) => file.endsWith('.ts'));
    const options = new Map();
    for (const file of optionFiles) {
        const filePath = path_1.default.join(__dirname, "options", file);
        const { default: option } = require(filePath);
        options.set(option.name, option);
    }
    const args = {
        argv: argv,
        commandValues: commandValues,
        options: options
    };
    if (commands.has(command)) {
        await commands.get(command).execute(args);
    }
    else {
        console.log(cli_color_1.default.red(command ?
            `Command not found: ${command}` : `No command provided`), `\nRun '${config_1.APP_TITLE} ${config_1.CLI_ARGS.commands.help}' for app usage`);
    }
})();
