import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";


import { log, logValue, exitProcess } from "../../../helpers/utils";
import { PoolConfigType, IPoolClient } from "../../../helpers/types";
import { CLI_ARGS, STREAM_PARAMS } from "../../../helpers/config";
import { parseError } from "../../../helpers/errors";




export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining reddit");

    const method = argv["method"];
    const subreddit = argv["subreddit"];
    const username = argv["username"];

    switch (method) {
        case undefined: case CLI_ARGS.sources.reddit.methods.posts:
          if (!method) {
            log(`Defaulting to posts method ...`, null);
          }
          minePostsByKeywords(poolClient);
          return;
        case CLI_ARGS.sources.reddit.methods.subreddit:
          if (!subreddit) {
            exitProcess(`Subreddit not provided`, 1);
          }
          minePostsBySubreddit(poolClient, { subreddit: subreddit });
          return;
        case CLI_ARGS.sources.reddit.methods.user:
          if (!username) {
            exitProcess(`Username not provided`, 1);
          }
          minePostsByUser(poolClient, { username: username });
          return;
        default:
          exitProcess(`Invalid method provided`, 1);
    }
}


async function minePostsByKeywords(poolClient: IPoolClient) {
    let cursor = null;

    do {
        await new Promise(r => setTimeout(r, 2000));

        let posts = await poolClient.reddit.get(
            "/r/all/search",
            {
                q: "wildlife",
                limit: 100
            }
        );
        
        cursor = posts.data.after;


    } while(cursor != null);
}

async function minePostsBySubreddit(poolClient: IPoolClient, args: { subreddit: string }) {

}

async function minePostsByUser(poolClient: IPoolClient, args: { username: string }) {

}