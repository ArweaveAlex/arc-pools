"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.validatePoolConfig = void 0;
var fs_1 = __importDefault(require("fs"));
var utils_1 = require("./utils");
var config_1 = require("./config");
function validatePoolConfig(args) {
    if (!args.commandValues || !args.commandValues.length) {
        (0, utils_1.exitProcess)("Pool Not Provided", 1);
    }
    var poolArg = args.commandValues[0];
    var POOLS_JSON = JSON.parse(fs_1["default"].readFileSync(config_1.POOLS_PATH).toString());
    if (!(poolArg in POOLS_JSON)) {
        (0, utils_1.exitProcess)("Pool Not Found", 1);
    }
    // TODO - validate JSON
    return POOLS_JSON[poolArg];
}
exports.validatePoolConfig = validatePoolConfig;
