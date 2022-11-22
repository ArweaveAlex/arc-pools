"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const option = {
    name: config_1.CLI_ARGS.options.mentionTag,
    description: `Specifies the username for --source twitter --method user (do not include '@' handle)`,
};
exports.default = option;
