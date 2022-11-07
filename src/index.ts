import { readFileSync } from "fs";

import { ARGS, POOLS_PATH } from "./config";
import { LANGUAGE } from "./language";

import { mineTweets } from './artifacts/miners/twitter';
import { mineWikipedia } from './artifacts/miners/wikipedia';

const POOLS = JSON.parse(readFileSync(POOLS_PATH).toString());

function createPool() {
    console.log(POOLS);
}

function mineArtifacts(poolSlug: string, source: string) {
    if(source ==='twitter') mineTweets(poolSlug);
    if(source === 'wikipedia') mineWikipedia(poolSlug);
}

switch (process.argv[2]) {
    case ARGS.createPool:
        createPool();
        break;
    case ARGS.mineArtifacts:
        if(process.argv[3]){
            if(process.argv[4] === 'twitter' || process.argv[4] === 'wikipedia'){
                mineArtifacts(process.argv[3], process.argv[4]);
            } else {
                console.log(LANGUAGE.invalidArgs());
            }
        } else {
            console.log(LANGUAGE.invalidArgs());
        }
        break;
    default:
        console.log(LANGUAGE.invalidArgs());
        break;
}