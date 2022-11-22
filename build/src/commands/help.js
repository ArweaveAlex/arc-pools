"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const figlet_1 = __importDefault(require("figlet"));
const config_1 = require("../config");
const command = {
    name: config_1.CLI_ARGS.commands.help,
    execute: async (args) => {
        console.log(cli_color_1.default.magenta(figlet_1.default.textSync(config_1.APP_TITLE)));
        console.log(args);
    }
};
exports.default = command;
//# sourceMappingURL=help.js.map