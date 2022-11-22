"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitProcess = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
function exitProcess(message, status) {
    console.log(status === 0 ? cli_color_1.default.green(message) : cli_color_1.default.red(message));
    process.exit(status);
}
exports.exitProcess = exitProcess;
//# sourceMappingURL=utils.js.map