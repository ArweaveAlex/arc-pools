import fs from "fs";
import clc from "cli-color";
import minimist from "minimist";
import * as tApiV2 from "twitter-api-v2";

import Bundlr from "@bundlr-network/client";
import { Contract, LoggerFactory } from "warp-contracts";

import { ArweaveClient } from "../../../arweave-client";

import { exitProcess } from "../../../utils";
import { PoolConfigType } from "../../../types";
import { CLI_ARGS, STREAM_PARAMS } from "../../../config";

import { modTweet, processIds, processTweetV2 } from ".";

const arClient = new ArweaveClient();

let poolConfig: PoolConfigType;

let twitterV2: tApiV2.TwitterApi;
let twitterV2Bearer: tApiV2.TwitterApi;
let contentModeration: boolean;

let walletKey: string;
let bundlr: Bundlr;
let contract: Contract;


// TODO - TwitterClient Class / Add bundlr - contract to ArweaveClient Class
export async function run(config: PoolConfigType, argv: minimist.ParsedArgs) {
  poolConfig = config;

  try {
    walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
  }
  catch {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  twitterV2Bearer = new tApiV2.TwitterApi(poolConfig.twitterApiKeys.bearer_token);

  LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
  LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
  LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");

  twitterV2 = new tApiV2.TwitterApi({
    appKey: poolConfig.twitterApiKeys.consumer_key,
    appSecret: poolConfig.twitterApiKeys.consumer_secret,
    accessToken: poolConfig.twitterApiKeys.token,
    accessSecret: poolConfig.twitterApiKeys.token_secret,
  });

  bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", walletKey);
  contract = arClient.warp.contract(poolConfig.contracts.pool.id);

  const method = argv["method"];
  const mentionTag = argv["mention-tag"];
  const username = argv["username"];

  contentModeration = argv["content-moderation"];

  switch (method) {
    case undefined: case CLI_ARGS.sources.twitter.methods.stream:
      if (!method) {
        console.log(`Defaulting to stream method ...`);
      }
      mineTweetsByStream();
      return;
    case CLI_ARGS.sources.twitter.methods.mention:
      if (!mentionTag) {
        exitProcess(`Mention tag not provided`, 1);
      }
      mineTweetsByMention(mentionTag);
      return;
    case CLI_ARGS.sources.twitter.methods.user:
      if (!username) {
        exitProcess(`Username not provided`, 1);
      }
      mineTweetsByUser(username);
      return;
    default:
      exitProcess(`Invalid method provided`, 1);
  }
}

// Delete the stream rules before and after this run.
// Before to clear out any previous leftovers from failed runs
async function deleteStreamRules() {
  const rules = await twitterV2Bearer.v2.streamRules();

  if (rules.data?.length) {
    await twitterV2Bearer.v2.updateStreamRules({
      delete: { ids: rules.data.map(rule => rule.id) },
    });
  }
}

// Start a twitter stream, process to Arweave one by one
async function mineTweetsByStream() {
  console.log("Mining tweets by stream...");
  let stream: tApiV2.TweetStream;
  try {
    await deleteStreamRules();
    stream = twitterV2Bearer.v2.searchStream({ ...STREAM_PARAMS, autoConnect: false });

    let rules = poolConfig.keywords.map((keyword: string) => {
      return {
        value: keyword,
        tag: keyword.toLowerCase().replace(/\s/g, '')
      }
    });

    await twitterV2Bearer.v2.updateStreamRules({
      add: rules,
    });

    await stream.connect({ autoReconnect: false });

    for await (const tweet of stream) {
      let finalTweet = modTweet(tweet);
      await processTweetV2(
        finalTweet,
        poolConfig,
        contentModeration,
        bundlr,
        contract
      );
    }

  }
  catch (e: any) {
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
async function mineTweetsByMention(mentionTag: string) {
  console.log(`Mining Tweets by mention ...`);
  console.log(`Mention Tag - [`, clc.green(`'${mentionTag}'`), `]`);

  try {
    let query = mentionTag;
    let resultSet: any;
    let allTweets: any[] = [];
    do {
      let params: tApiV2.Tweetv2SearchParams = {
        max_results: 100,
        query: query,
        "tweet.fields": ['referenced_tweets']
      };
      if (resultSet) params.next_token = resultSet.meta.next_token;
      resultSet = await twitterV2.v2.search(
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

    await processIds(ids, poolConfig, contentModeration);
  } catch (e: any) {
    exitProcess(`Twitter mining failed \n${e}`, 1);  }
}

/*
 * Mine all of a specific users tweets
 * ignoring duplicates
 * @param username: string 
 */
async function mineTweetsByUser(username: string) {
  console.log(`Mining Tweets by user ...`);
  console.log(`User - [`, clc.green(`'${username}'`), `]`);
  // let user: any;

  // try {
  //   user = await twitterV2.v2.userByUsername(username);
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
  //     let params: TweetV2UserTimelineParams = {
  //       max_results: 100
  //     };
  //     if (userTimeline) params.pagination_token = userTimeline.meta.next_token;

  //     userTimeline = await twitterV2.v2.userTimeline(
  //       uid,
  //       params
  //     );
  //     if (userTimeline.data.data) allTweets = allTweets.concat(userTimeline.data.data);
  //   } while (userTimeline.meta.next_token);

  //   console.log(`${allTweets.length} tweets fetched`);

  // let ids = allTweets.map((tweet: any) => {
  //     return tweet.id
  // });

  // console.log(ids);
  // await processIds(ids);
  // }
  await processIds(["1610701267650723852"], poolConfig, contentModeration)
}
