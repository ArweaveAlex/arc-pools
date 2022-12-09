import fs from "fs";

import { ArgumentsInterface, CommandInterface } from "../interfaces";
import { CLI_ARGS, POOL_FILE } from "../config";
import { exitProcess } from "../utils";

const command: CommandInterface = {
    name: CLI_ARGS.commands.init,
    description: `Initialize ${POOL_FILE}`,
    options: [],
    args: ["pool id"],
    execute: async (args: ArgumentsInterface): Promise<void> => {
        if (!args.commandValues || !args.commandValues.length) {
            exitProcess(`Pool id Not Provided`, 1);
        }

        if(!fs.existsSync(POOL_FILE)){
            fs.writeFileSync(POOL_FILE, JSON.stringify({}, null, 4));
        }

        const poolArg = args.commandValues[0];
        const poolJsonFile = JSON.parse(fs.readFileSync(POOL_FILE).toString());

        if(poolJsonFile.hasOwnProperty(poolArg)){
            exitProcess(`Pool id already exists`, 1);
        }

        poolJsonFile[poolArg] = poolJson;

        fs.writeFileSync(POOL_FILE, JSON.stringify(poolJsonFile, null, 4));

        console.log("Pool initialized in " + POOL_FILE)
    }
}

let poolJson = 
     {
        "appType": "Alex-Archiving-Pool-v1.4", 
        "contracts": {
            "nft": {
                "id": "",
                "src": ""
            },
            "pool": {
                "id": "",
                "src": ""
            }
        },
        "state": {
            "owner": {
                "pubkey": "",
                "info": ""
            },
            "title": "Pool Title such as Russia Ukraine War",
            "description": "Paragraph/html markup for long pool description on site",
            "briefDescription": "Text for short pool description on site",
            "link": "",
            "rewards": "",
            "image": "",
            "timestamp": ""
        },
        "walletPath": "",
        "bundlrNode": "https://node2.bundlr.network",
        "twitter": {
            "userIds": [
                
            ]
        },
        "keywords": [
            "keyword1",
        ],
        "twitterApiKeys": {
            "consumer_key": "",
            "consumer_secret": "",
            "token": "",
            "token_secret": "",
            "bearer_token": ""
        },
        "clarifaiApiKey": ""
    };


export default command;