import { readFileSync } from "fs";

import { CLI_ARGS, POOLS_PATH } from "./config";
import { LANGUAGE } from "./language";

import { 
    mineTweets, 
    mineTweetsByUser, 
    mineTweetsByMention 
} from './artifacts/miners/twitter';

import { mineWikipedia } from './artifacts/miners/wikipedia';

/**
 * Todo: write this cli with named arguments etc...
 */


const POOLS = JSON.parse(readFileSync(POOLS_PATH).toString());

function create() {
    console.log(POOLS);
}

function mineArtifacts(
    poolSlug: string, 
    source: string,
    twitterOperation: string | null
) {
    if(source ==='twitter') {
        if(twitterOperation){
            if(twitterOperation === 'user') {
                mineTweetsByUser(poolSlug);
            } else if(twitterOperation ==='mentions') {
                mineTweetsByMention(poolSlug);
            }
        } else {
            mineTweets(poolSlug)  
        }
    }else if(source === 'wikipedia') {
        mineWikipedia(poolSlug)
    };
}

switch (process.argv[2]) {
    case CLI_ARGS.create:
        create();
        break;
    case CLI_ARGS.mineArtifacts:
        if(process.argv[3]){
            if(process.argv[4] === 'twitter' || process.argv[4] === 'wikipedia'){
                mineArtifacts(
                    process.argv[3],
                    process.argv[4], 
                    process.argv[5]
                );
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