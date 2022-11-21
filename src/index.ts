import { readFileSync, readdirSync } from "fs";
import path from 'path';
const pm2 = require('pm2');

import { CLI_ARGS, POOLS_PATH } from "./config";

import { 
    mineTweets, 
    mineTweetsByUser, 
    mineTweetsByMention 
} from './artifacts/miners/twitter';

import { mineWikipedia } from './artifacts/miners/wikipedia';

/**
 * Todo: write this cli with named arguments etc...
 */

const localDir = path.join(__dirname, '../local');
console.log(localDir);

const POOLS = JSON.parse(readFileSync(POOLS_PATH).toString());

function create() {
    console.log(POOLS);
}

function mineArtifacts(
    poolSlug: string, 
    source: string,
    twitterOperation: string | null,
    twitterParam: string | null
) {
    if(source ==='twitter') {
        if(twitterOperation){
            if(twitterOperation === 'user') {
                mineTweetsByUser(poolSlug, twitterParam);
            } else if(twitterOperation ==='mentions') {
                mineTweetsByMention(poolSlug, twitterParam);
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
                if(process.argv[5] === 'daemon'){
                    runPm2();
                }
                mineArtifacts(
                    process.argv[3],
                    process.argv[4], 
                    process.argv[5],
                    process.argv[6]
                );
            } else {
                console.log("Invalid args");
            }
        } else {
            console.log("Invalid args");
        }
        break;
    default:
        console.log("Invalid args");
        break;
}

function runPm2(){
    pm2.connect(function(err: any) {
        if (err) {
          console.error(err)
          process.exit(2)
        }
      
        pm2.start({
          script    : 'build/index.js mine crypto-crunch twitter',
          name      : 'arcpool'
        }, function(err: any, apps: any) {
          if (err) {
            console.error(err)
            return pm2.disconnect()
          }
      
          pm2.list((err: any, list: any) => {
            // console.log(err, list)
      
            pm2.restart('arcpool', (err: any, proc: any) => {
              // Disconnects from PM2
              pm2.disconnect()
            })
          })
        })
    })
}