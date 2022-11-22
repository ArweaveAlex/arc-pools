"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter = __importStar(require("../artifacts/miners/twitter"));
const wikipedia = __importStar(require("../artifacts/miners/wikipedia"));
const source_1 = __importDefault(require("../options/source"));
const method_1 = __importDefault(require("../options/method"));
const utils_1 = require("../utils");
const validations_1 = require("../validations");
const config_1 = require("../config");
const command = {
    name: config_1.CLI_ARGS.commands.mine,
    options: [source_1.default, method_1.default],
    execute: async (args) => {
        const poolConfig = (0, validations_1.validatePoolConfig)(args);
        const { source, method } = args.argv;
        if (!source) {
            (0, utils_1.exitProcess)(`No Source Provided`, 1);
        }
        switch (source) {
            case config_1.CLI_ARGS.sources.twitter.name:
                await twitter.run(poolConfig, method);
                return;
            case config_1.CLI_ARGS.sources.wikipedia.name:
                wikipedia.run(poolConfig);
                return;
            default:
                (0, utils_1.exitProcess)(`Source Not Found`, 1);
        }
    }
};
exports.default = command;
//# sourceMappingURL=mine.js.map