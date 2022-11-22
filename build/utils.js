"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.exitProcess = void 0;
var cli_color_1 = __importDefault(require("cli-color"));
function exitProcess(message) {
    console.log(cli_color_1["default"].red(message));
    process.exit(1);
}
exports.exitProcess = exitProcess;
