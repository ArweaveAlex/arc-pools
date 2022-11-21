"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var config_1 = require("./config");
var twitter_1 = require("./artifacts/miners/twitter");
var wikipedia_1 = require("./artifacts/miners/wikipedia");
/**
 * Todo: write this cli with named arguments etc...
 */
var localDir = path_1["default"].join(__dirname, '../local');
console.log(localDir);
var POOLS = JSON.parse((0, fs_1.readFileSync)(config_1.POOLS_PATH).toString());
function create() {
    console.log(POOLS);
}
function mineArtifacts(poolSlug, source, twitterOperation, twitterParam) {
    if (source === 'twitter') {
        if (twitterOperation) {
            if (twitterOperation === 'user') {
                (0, twitter_1.mineTweetsByUser)(poolSlug, twitterParam);
            }
            else if (twitterOperation === 'mentions') {
                (0, twitter_1.mineTweetsByMention)(poolSlug, twitterParam);
            }
        }
        else {
            (0, twitter_1.mineTweets)(poolSlug);
        }
    }
    else if (source === 'wikipedia') {
        (0, wikipedia_1.mineWikipedia)(poolSlug);
    }
    ;
}
switch (process.argv[2]) {
    case config_1.CLI_ARGS.create:
        create();
        break;
    case config_1.CLI_ARGS.mineArtifacts:
        if (process.argv[3]) {
            if (process.argv[4] === 'twitter' || process.argv[4] === 'wikipedia') {
                mineArtifacts(process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
            }
            else {
                console.log("Invalid args");
            }
        }
        else {
            console.log("Invalid args");
        }
        break;
    default:
        console.log("Invalid args");
        break;
}
