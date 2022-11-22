"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const option = {
    name: config_1.CLI_ARGS.options.mentionTag,
    description: `Specifies the mention tag for --source twitter --method mention (pass in single quotes for multiple tags i.e. '@AlexArchive #history')`,
};
exports.default = option;
