import fs from "fs";
import clc from "cli-color";
import tmp from "tmp-promise";
import * as path from "path";
import mime from "mime-types";
import { mkdir } from "fs/promises";
import * as tApiV2 from "twitter-api-v2";
import * as gql from "gql-query-builder";

import Bundlr from "@bundlr-network/client";
import { Contract, LoggerFactory } from "warp-contracts";

import { ArweaveClient } from "../../../arweave-client";

import {
  walk,
  checkPath,
  truncateString,
  processMediaURL,
  exitProcess
} from "../../../utils";
import { createAsset } from "../../assets";
import { TAGS, LOOKUP_PARAMS, CONTENT_TYPES } from "../../../config";
import { PoolConfigType } from "../../../types";
import { shouldUploadContent } from "../moderator";

const arClient = new ArweaveClient();

// Fetch 10 at a time for rate limit and speed
// Converts v2 tweets to v1
export async function processIds(
  ids: string[], 
  poolConfig: PoolConfigType, 
  contentModeration: boolean
) {
  let twitterV2: tApiV2.TwitterApi = new tApiV2.TwitterApi({
    appKey: poolConfig.twitterApiKeys.consumer_key,
    appSecret: poolConfig.twitterApiKeys.consumer_secret,
    accessToken: poolConfig.twitterApiKeys.token,
    accessSecret: poolConfig.twitterApiKeys.token_secret,
  });

  const walletKey = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
  const bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", walletKey);
  const contract = arClient.warp.contract(poolConfig.contracts.pool.id);

  LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
  LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
  LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");

  let allTweets: any[] = [];
  for (var j = 0; j < ids.length; j += 10) {
    const splitIds: string[] = ids.slice(j, j + 10);

    let rParents = await twitterV2.v2.tweets(splitIds, LOOKUP_PARAMS);
    if (rParents.data.length > 0) {
      allTweets = allTweets.concat(rParents)
    };
  }

  for (const tweet of allTweets) {
    let finalTweet = modTweet(tweet);
    // TODO - Uncomment dup
    let dup = await isDuplicate(finalTweet, poolConfig);
    if (!dup) {
      await processTweetV2(
        finalTweet, 
        poolConfig, 
        contentModeration, 
        bundlr,
        contract
      );
    } else {
      console.log(clc.red(`Tweet already mined: ${generateTweetName(finalTweet)}`));
    }
  }
}

export async function processTweetV2(
  tweet: any, 
  poolConfig: PoolConfigType, 
  contentModeration: boolean, 
  bundlr: Bundlr,
  contract: Contract
) {
  const tmpdir = await tmp.dir({ unsafeCleanup: true });
  await processMedia(tweet, tmpdir, poolConfig, contentModeration);
  const additionalMediaPaths = await processAdditionalMediaPaths(tweet, tmpdir, bundlr)
  
  if (tmpdir) {
    await tmpdir.cleanup()
  }

  await createAsset(
    bundlr,
    contract,
    tweet,
    additionalMediaPaths,
    poolConfig,
    CONTENT_TYPES.json,
    null
  );
}

async function processAdditionalMediaPaths(
  tweet: any, 
  tmpdir: any,
  bundlr: Bundlr
) {

  const subTags = [
    { name: TAGS.keys.application, value: TAGS.values.application },
    { name: TAGS.keys.tweetId, value: `${tweet.id_str ?? "unknown"}` }
  ]
  const additionalMediaPaths: { [key: string]: any } = {};

  for await (const f of walk(tmpdir.path)) {
    const relPath = path.relative(tmpdir.path, f)
    try {
      const mimeType = mime.contentType(mime.lookup(relPath) || CONTENT_TYPES.octetStream) as string;
      const tx = bundlr.createTransaction(
        await fs.promises.readFile(path.resolve(f)),
        { tags: [...subTags, { name: TAGS.keys.contentType, value: mimeType }] }
      )
      await tx.sign();
      const id = tx.id;
      const cost = await bundlr.getPrice(tx.size);
      fs.rmSync(path.resolve(f));
      try {
        await bundlr.fund(cost.multipliedBy(1.1).integerValue());
      } catch (e: any) {
        exitProcess(`Error funding bundlr - stopping process\n ${e}`, 1)
      }
      await tx.upload();
      if (!id) { throw new Error("Upload Error") }
      additionalMediaPaths[relPath] = { id: id };
    } catch (e: any) {
      fs.rmSync(path.resolve(f));
      console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`)
      continue
    }
  }

  return additionalMediaPaths;
}

async function processMedia(tweet: any, tmpdir: any, poolConfig: PoolConfigType, contentModeration: boolean) {
  if (tweet?.includes?.media?.length > 0) {
    try {
      const mediaDir = path.join(tmpdir.path, "media")
      if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir)
      }
      for (let i = 0; i < tweet.includes.media.length; i++) {
        const mediaObject = tweet.includes.media[i];
        const url = mediaObject.url;

        if (mediaObject && mediaObject.variants && (mediaObject.type === "video" || mediaObject.type === "animated_gif")) {
          const variants = mediaObject?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
          if (contentModeration) {
            let contentCheck = await shouldUploadContent(variants[0].url, mediaObject.type, poolConfig);
            if (!contentCheck) {
              return;
            }
          }
          await processMediaURL(variants[0].url, mediaDir, i)
        } else {
          if (mediaObject.type === "photo" || mediaObject.type === "image") {
            if (contentModeration) {
              let contentCheck = await shouldUploadContent(url, "image", poolConfig);
              if (!contentCheck) {
                return;
              }
            }
            await processMediaURL(url, mediaDir, i)
          }
        }
      }
    }
    catch (e: any) {
      console.error(`Error while archiving media: ${e}`)
      console.log(e);
    }
  }
}

// Reshape v2 tweet for Alex backwards compatibility
export function modTweet(tweet: any) {
  let finalTweet: any = {};
  let isListData = tweet.data.length && tweet.data.length > 0;

  finalTweet = tweet.data;

  if (isListData) {
    finalTweet = tweet.data[0];
  }
  if (!finalTweet.full_text) {
    finalTweet.full_text = finalTweet.text;
  }

  finalTweet.includes = tweet.includes;

  // Find the author of the tweet
  // Push that onto top level as the user
  for (let i = 0; i < tweet.includes.users.length; i++) {
    let author_id = tweet.data.author_id;
    if (isListData) {
      author_id = tweet.data[0].author_id
    }
    if (tweet.includes.users[i].id === author_id) {
      let user = tweet.includes.users[i];
      user.screen_name = user.username;
      finalTweet.user = user;
    }
  }

  return finalTweet;
}

// TODO - Remove GQL Query Builder user getGQLData
async function isDuplicate(tweet: any, poolConfig: PoolConfigType) {
  let tName = generateTweetName(tweet);

  const query = () => gql.query({
    operation: "transactions",
    variables: {
      tags: {
        value: [{
          name: "Artifact-Name",
          values: [tName]
        }, {
          name: "Pool-Id",
          values: [poolConfig.contracts.pool.id]
        }],
        type: "[TagFilter!]"
      }
    },
    fields: [
      {
        edges: [
          "cursor",
          {
            node: [
              "id",
              {
                "tags": [
                  "name",
                  "value"
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  const response = await arClient.arweavePost.api.post("/graphql", query());

  if (response.data && response.data.data) {
    if (response.data.data.transactions) {
      if (response.data.data.transactions.edges) {
        if (response.data.data.transactions.edges.length > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

export function generateTweetName(tweet: any) {
  if (tweet) {
    if (tweet.text) {
      if (tweet.text.length > 30) {
        return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.text, 30);
      } else {
        return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.text;
      }
    } else if (tweet.full_text) {
      if (tweet.full_text.length > 30) {
        return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.full_text, 30);
      } else {
        return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.full_text;
      }
    } else {
      return 'Username: ' + tweet.user.name + ', Tweet Id: ' + tweet.id;
    } 
  }
  else {
    return 'Username: unknown'
  }
}