import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";

import { log, exitProcess } from "../../../helpers/utils";
import { PoolConfigType, IPoolClient } from "../../../helpers/types";
import { CLI_ARGS} from "../../../helpers/config";
import { parseError } from "../../../helpers/errors";

import { processPosts } from ".";


export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    log(`Mining reddit ...`, 0);

    const method = argv["method"];
    const subreddit = argv["subreddit"];
    const username = argv["username"];
    const searchTerm = argv["search-term"];

    switch (method) {
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

async function minePostsBySearch(poolClient: IPoolClient, args: { searchTerm: string }) {
  let url = `/r/all/search`;
  let additionalParams = {q: args.searchTerm};
  await minePosts(poolClient, additionalParams, url);
}

async function minePostsBySubreddit(poolClient: IPoolClient, args: { subreddit: string }) {
  let url = `/r/${args.subreddit}/new.json`;
  console.log(url);
  await minePosts(poolClient, {}, url);
}

async function minePostsByUser(poolClient: IPoolClient, args: { username: string }) {
  let url = `/user/${args.username}/submitted.json`;
  await minePosts(poolClient, {}, url);
}


async function minePosts(poolClient: IPoolClient, additionalParams: any, url: string) {
  try {
    let cursor = null;
    do {
        await new Promise(r => setTimeout(r, 2000));

        let posts = await poolClient.reddit.get(
            url,
            {
              ...additionalParams, 
              ...{
                limit: 100,
                after: cursor,
                sort: "new"
              }
            }
        );

        cursor = posts.data.after;

        await processPosts(
          poolClient, 
          {posts: posts.data.children, contentModeration: false}
        );
    } while(cursor != null);
  } catch (e: any) {
    console.log(e)
    exitProcess(parseError(e, "reddit"), 1);
  }
}