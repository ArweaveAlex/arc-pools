import clc from "cli-color";
import minimist from "minimist";
import * as tApiV2 from "twitter-api-v2";

import { PoolClient } from "../../../clients/pool";

import {
  processIdsV2,
  processThreadV2,
  deleteStreamRules
} from ".";
import { exitProcess } from "../../../utils";
import { PoolConfigType, IPoolClient } from "../../../types";
import { CLI_ARGS, STREAM_PARAMS } from "../../../config";

let contentModeration: boolean;

// TODO - Test all methods
export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  const method = argv["method"];
  const mentionTag = argv["mention-tag"];
  const username = argv["username"];

  contentModeration = argv["content-moderation"];

  switch (method) {
    case undefined: case CLI_ARGS.sources.twitter.methods.stream:
      if (!method) {
        console.log(`Defaulting to stream method ...`);
      }
      mineTweetsByStream(poolClient);
      return;
    case CLI_ARGS.sources.twitter.methods.mention:
      if (!mentionTag) {
        exitProcess(`Mention tag not provided`, 1);
      }
      mineTweetsByMention(poolClient, { mentionTag: mentionTag });
      return;
    case CLI_ARGS.sources.twitter.methods.user:
      if (!username) {
        exitProcess(`Username not provided`, 1);
      }
      mineTweetsByUser(poolClient, { username: username });
      return;
    default:
      exitProcess(`Invalid method provided`, 1);
  }
}

// Start a twitter stream, process to Arweave one by one
async function mineTweetsByStream(poolClient: IPoolClient) {
  console.log(`Mining tweets by stream ...`);
  let stream: tApiV2.TweetStream;

  try {
    await deleteStreamRules(poolClient);
    stream = poolClient.twitterV2Bearer.v2.searchStream({ ...STREAM_PARAMS, autoConnect: false });

    let rules = poolClient.poolConfig.keywords.map((keyword: string) => {
      return {
        value: keyword,
        tag: keyword.toLowerCase().replace(/\s/g, '')
      }
    });

    await poolClient.twitterV2Bearer.v2.updateStreamRules({
      add: rules,
    });

    await stream.connect({ autoReconnect: false });

    for await (const tweet of stream) {
      await processThreadV2(poolClient, {
        tweet: tweet,
        contentModeration: contentModeration
      });
    }

  }
  catch (e: any) {
    console.log(e)
    if (stream) {
      stream.close();
    }
    exitProcess(`Twitter mining failed \n${e}`, 1);
  }
}

/*
 * If someone says @thealexarchive #crypto etc...
 * this will grab those and mine them to the pool
 * @param mentionTag: string
 */
async function mineTweetsByMention(poolClient: IPoolClient, args: { mentionTag: string }) {
  console.log(`Mining Tweets by mention ...`);
  console.log(`Mention Tag - [`, clc.green(`'${args.mentionTag}'`), `]`);

  try {
    let query = args.mentionTag;
    let resultSet: any;
    let allTweets: any[] = [];
    do {
      let params: tApiV2.Tweetv2SearchParams = {
        max_results: 100,
        query: query,
        "tweet.fields": ['referenced_tweets']
      };
      if (resultSet) params.next_token = resultSet.meta.next_token;
      resultSet = await poolClient.twitterV2.v2.search(
        query,
        params
      );
      if (resultSet.data.data) allTweets = allTweets.concat(resultSet.data.data);
    } while (resultSet.meta.next_token);


    // Get the parent tweets from the mentions above and remove duplicate ids
    let ids = allTweets.map((tweet: any) => {
      if (tweet.referenced_tweets && tweet.referenced_tweets.length > 0) {
        return tweet.referenced_tweets[0].id;
      }
    }).filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    });

    await processIdsV2(poolClient, {
      ids: ids,
      contentModeration: contentModeration
    });
  } catch (e: any) {
    exitProcess(`Twitter mining failed \n${e}`, 1);
  }
}

/*
 * Mine all of a specific users tweets
 * ignoring duplicates
 * @param username: string 
 */
async function mineTweetsByUser(poolClient: IPoolClient, args: { username: string }) {
  console.log(`Mining Tweets by user ...`);
  console.log(`User - [`, clc.green(`'${args.username}'`), `]`);
  // let user: any;

  // try {
  //   user = await poolClient.twitterV2.v2.userByUsername(args.username);
  //   console.log(`User ID - [`, clc.green(`'${user.data.id}'`), `]`);
  // }
  // catch {
  //   exitProcess(`User not found`, 1)
  // }

  // if (user) {
  //   let uid = user.data.id;

  //   let userTimeline: any;
  //   let allTweets: any[] = [];
  //   do {
  //     let params: tApiV2.TweetV2UserTimelineParams = {
  //       max_results: 100
  //     };
  //     if (userTimeline) params.pagination_token = userTimeline.meta.next_token;

  //     userTimeline = await poolClient.twitterV2.v2.userTimeline(
  //       uid,
  //       params
  //     );
  //     if (userTimeline.data.data) allTweets = allTweets.concat(userTimeline.data.data);
  //   } while (userTimeline.meta.next_token);

  //   console.log(`${allTweets.length} tweets fetched`);

  //   let ids = allTweets.map((tweet: any) => {
  //     return tweet.id
  //   });

  //   console.log(ids);
  // }

  await processIdsV2(poolClient, {
    ids: ["1610988945600577536"],
    contentModeration: contentModeration
  });
}