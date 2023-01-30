import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";


import { log, exitProcess } from "../../../helpers/utils";
import { PoolConfigType, IPoolClient } from "../../../helpers/types";
import { CLI_ARGS} from "../../../helpers/config";
// import { parseError } from "../../../helpers/errors";

import { processPosts } from ".";




export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    log("Mining reddit", 0);

    const method = argv["method"];
    const subreddit = argv["subreddit"];
    const username = argv["username"];
    const searchTerm = argv["search-term"];

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
        case CLI_ARGS.sources.reddit.methods.search:
          if (!searchTerm) {
            exitProcess(`Search term not provided`, 1);
          }
          minePostsBySearch(poolClient, { searchTerm: searchTerm });
          return;
        default:
          exitProcess(`Invalid method provided`, 1);
    }
}


async function minePostsByKeywords(_poolClient: IPoolClient) {
    let cursor = null;

    do {
        await new Promise(r => setTimeout(r, 2000));

        
    } while(cursor != null);
}

async function minePostsBySearch(poolClient: IPoolClient, args: { searchTerm: string }) {
  try{
    // let cursor = null;

    // do {
    //     await new Promise(r => setTimeout(r, 2000));

    //     let posts = await poolClient.reddit.get(
    //         "/r/all/search",
    //         {
    //             q: args.searchTerm,
    //             limit: 100,
    //             after: cursor,
    //             //sort: "new"
    //         }
    //     );
        
    //     cursor = posts.data.after;

        // let ids: string[] = posts.data.children.map((p: any) => { return p.data.id });

        await processPosts(
          poolClient, 
          {posts: [], contentModeration: false}
        );
    // } while(cursor != null);
  } catch (e: any) {
    console.log(e)
  }
}

async function minePostsBySubreddit(_poolClient: IPoolClient, _args: { subreddit: string }) {
  
}

async function minePostsByUser(_poolClient: IPoolClient, _args: { username: string }) {

}