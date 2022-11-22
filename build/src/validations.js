"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePoolConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const config_1 = require("./config");
function validatePoolConfig(args) {
    if (!args.commandValues || !args.commandValues.length) {
        (0, utils_1.exitProcess)(`Pool Not Provided`, 1);
    }
    const poolArg = args.commandValues[0];
    const POOLS_JSON = JSON.parse(fs_1.default.readFileSync(config_1.POOLS_PATH).toString());
    if (!(poolArg in POOLS_JSON)) {
        (0, utils_1.exitProcess)(`Pool Not Found`, 1);
    }
    // TODO - validate JSON
    return POOLS_JSON[poolArg];
}
exports.validatePoolConfig = validatePoolConfig;
//# sourceMappingURL=validations.js.map