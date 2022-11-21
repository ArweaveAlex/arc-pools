"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const config_1 = require("./config");
const language_1 = require("./language");
const twitter_1 = require("./artifacts/miners/twitter");
const wikipedia_1 = require("./artifacts/miners/wikipedia");
/**
 * Todo: write this cli with named arguments etc...
 */
const POOLS = JSON.parse((0, fs_1.readFileSync)(config_1.POOLS_PATH).toString());
function createPool() {
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
    case config_1.ARGS.createPool:
        createPool();
        break;
    case config_1.ARGS.mineArtifacts:
        if (process.argv[3]) {
            if (process.argv[4] === 'twitter' || process.argv[4] === 'wikipedia') {
                mineArtifacts(process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
            }
            else {
                console.log(language_1.LANGUAGE.invalidArgs());
            }
        }
        else {
            console.log(language_1.LANGUAGE.invalidArgs());
        }
        break;
    default:
        console.log(language_1.LANGUAGE.invalidArgs());
        break;
}
