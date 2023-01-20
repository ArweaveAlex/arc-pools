import minimist from "minimist";
import * as tApiV2 from "twitter-api-v2";

import { PoolClient } from "../../../clients/pool";

import {
  processIdsV2,
  processThreadV2,
  modifyStreamTweet,
  deleteStreamRules
} from ".";
import { log, logValue, exitProcess } from "../../../helpers/utils";
import { PoolConfigType, IPoolClient } from "../../../helpers/types";
import { CLI_ARGS, STREAM_PARAMS } from "../../../helpers/config";
import { parseError } from "../../../helpers/errors";

let contentModeration: boolean;

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
  const poolClient = new PoolClient(poolConfig);

  if (!poolClient.walletKey) {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }

  if (!poolClient.poolConfig.topics) {
    exitProcess(`Configure topics in pools.json`, 1);
  }

  const method = argv["method"];
  const mentionTag = argv["mention-tag"];
  const username = argv["username"];

  contentModeration = argv["content-moderation"];

  switch (method) {
    case undefined: case CLI_ARGS.sources.twitter.methods.stream:
      if (!method) {
        log(`Defaulting to stream method ...`, null);
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

async function mineTweetsByStream(poolClient: IPoolClient) {
  log(`Mining tweets by stream ...`, null);
  let stream: tApiV2.TweetStream;

  try {
    await deleteStreamRules(poolClient);
    stream = poolClient.twitterV2Bearer.v2.searchStream({ ...STREAM_PARAMS, autoConnect: false });

    const rules = poolClient.poolConfig.keywords.map((keyword: string) => {
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
        tweet: modifyStreamTweet(tweet),
        contentModeration: contentModeration
      });
    }

  }
  catch (e: any) {
    if (stream) {
      stream.close();
    }
    exitProcess(parseError(e, "twitter"), 1);
  }
}

/*
 * @param mentionTag: string
*/
async function mineTweetsByMention(poolClient: IPoolClient, args: { mentionTag: string }) {
  log(`Mining Tweets by mention ...`, null); logValue(`Mention Tag`, args.mentionTag, 0);

  try {
    let query = args.mentionTag.includes("@") ? args.mentionTag.replace("@", "") : args.mentionTag;
    let resultSet: any;
    let allTweets: any[] = [];
    do {
      let params: tApiV2.Tweetv2SearchParams = {
        max_results: 100,
        query: query,
        "tweet.fields": ['referenced_tweets']
      };
      if (resultSet) params.next_token = resultSet.meta.next_token;
      resultSet = await poolClient.twitterV2.v2.search(query, params);

      if (resultSet.data.data) allTweets = allTweets.concat(resultSet.data.data);
      logValue(`Fetching Ids`, allTweets.length.toString(), 0);
    }
    while (resultSet.meta.next_token);

    let ids = allTweets.map((tweet: any) => {
      if (tweet.referenced_tweets && tweet.referenced_tweets.length > 0) {
        return tweet.referenced_tweets[0].id;
      }
    }).filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    }).filter(id => id !== undefined);

    await processIdsV2(poolClient, {
      ids: ids,
      contentModeration: contentModeration
    });
  }
  catch (e: any) {
    exitProcess(parseError(e, "twitter"), 1);
  }
}

/*
 * @param username: string 
*/
async function mineTweetsByUser(poolClient: IPoolClient, args: { username: string }) {
  log(`Mining Tweets by user ...`, null); logValue(`User`, args.username, 0);
  let user: any;

  try {
    user = await poolClient.twitterV2.v2.userByUsername(
      args.username.includes("@") ? args.username.replace("@", "") : args.username);
    logValue(`User Id`, user.data.id, 0);
  

    if (user) {
      const uid = user.data.id;
      let userTimeline: any;
      let allTweets: any[] = [];

      do {
        const params: tApiV2.TweetV2UserTimelineParams = {
          max_results: 100
        };
        if (userTimeline) params.pagination_token = userTimeline.meta.next_token;

        userTimeline = await poolClient.twitterV2.v2.userTimeline(uid, params);
        if (userTimeline.data.data) allTweets = allTweets.concat(userTimeline.data.data);
        logValue(`Fetching Ids`, allTweets.length.toString(), 0);
      }
      while (userTimeline.meta.next_token);

      const ids = allTweets.map((tweet: any) => {
        return tweet.id
      });

      await processIdsV2(poolClient, {
        ids: ids,
        contentModeration: contentModeration
      });
    }
  } catch (e: any){
    exitProcess(parseError(e, "twitter"), 1);
  }
}