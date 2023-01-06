import fs from "fs";
import axios from "axios";
import clc from "cli-color";
import tmp from "tmp-promise";
import * as path from "path";
import mime from "mime-types";
import { mkdir } from "fs/promises";
import * as gql from "gql-query-builder";

import { PoolClient } from "../../../clients/pool";
import { ArweaveClient } from "../../../clients/arweave";

import {
  walk,
  checkPath,
  truncateString,
  processMediaURL,
  exitProcess
} from "../../../utils";
import { createAsset } from "../../assets";
import { TAGS, LOOKUP_PARAMS, CONTENT_TYPES } from "../../../config";
import { IPoolClient } from "../../../types";
import { shouldUploadContent } from "../moderator";

const arClient = new ArweaveClient();

// Fetch 10 at a time for rate limit and speed
// Converts v2 tweets to v1
export async function processIdsV2(poolClient: IPoolClient, args: {
  ids: string[],
  contentModeration: boolean
}) {
  let tweets = await getTweetsfromIds(poolClient, { ids: args.ids });

  for (const tweet of tweets) {
    // TODO - Uncomment dup
    // let dup = await isDuplicate(poolClient, { tweet: finalTweet });
    // if (!dup) {
    await processThreadV2(poolClient, {
      tweet: tweet,
      contentModeration: args.contentModeration
    });
    // } else {
    //   console.log(clc.red(`Tweet already mined: ${generateAssetName(finalTweet)}`));
    // }
  }
}

/** 
 * Take one tweet as argument, check if it is part of a conversation
 * Get thread tweets and run processTweetV2 with associationId - conversationId
 * If tweet is not part of a thread, run processTweetV2 with associationId - null (No Association-Id Tag)
**/
export async function processThreadV2(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean
}) {
  const finalParentTweet = modTweet(args.tweet);
  
  let associationId: string | null = null;
  let associationSequence: string | null = "0";

  if (!finalParentTweet.conversation_id) {
    return;
  }

  const thread = await getThread(poolClient, {
    conversationId: finalParentTweet.conversation_id
  });

  if (thread && thread.length > 0) {
    const childTweets = await getTweetsfromIds(poolClient, { ids: thread.map((tweet: any) => tweet.id) });
    
    // associationId = finalParentTweet.conversation_id;

        processTweetV2(poolClient, {
          tweet: modTweet(childTweets[0]),
          contentModeration: args.contentModeration,
          associationId: associationId,
          associationSequence: "0"
        });

    // for (let i = 1; i < childTweets.length + 1; i++) {
    //     const finalChildTweet = modTweet(childTweets[i - 1]);

    //     processTweetV2(poolClient, {
    //       tweet: finalChildTweet,
    //       contentModeration: args.contentModeration,
    //       associationId: associationId,
    //       associationSequence: i.toString()
    //     });
    // }
  }

  // processTweetV2(poolClient, {
  //   tweet: finalParentTweet,
  //   contentModeration: args.contentModeration,
  //   associationId: associationId,
  //   associationSequence: associationSequence
  // });
}

export async function processTweetV2(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean,
  associationId: string | null,
  associationSequence: string  | null
}) {
  
  const tmpdir = await tmp.dir({ unsafeCleanup: true });

  const additionalMediaPaths = await processAdditionalMediaPaths(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir
  });

  await processMedia(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    contentModeration: args.contentModeration
  });

  if (tmpdir) {
    await tmpdir.cleanup()
  }

  await createAsset(poolClient, {
    content: args.tweet,
    contentType: CONTENT_TYPES.json,
    additionalMediaPaths: additionalMediaPaths,
    associationId: args.associationId,
    associationSequence: args.associationSequence,
    title: null
  })
}

async function getThread(poolClient: IPoolClient, args: {
  conversationId: string
}) {

  const response = await axios.get(`https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${args.conversationId}&tweet.fields=in_reply_to_user_id,author_id,created_at,conversation_id&max_results=100`, {
    headers: {
      Authorization: `Bearer ${poolClient.poolConfig.twitterApiKeys.bearer_token}`
    }
  });

  if (response.data && response.data.data && response.data.data.length > 0) {
    return response.data.data;
  }

  return null
}

async function processAdditionalMediaPaths(poolClient: IPoolClient, args: {
  tweet: any,
  tmpdir: any
}) {

  const subTags = [
    { name: TAGS.keys.application, value: TAGS.values.application },
    { name: TAGS.keys.tweetId, value: `${args.tweet.id_str ?? "unknown"}` }
  ]
  const additionalMediaPaths: { [key: string]: any } = {};

  for await (const f of walk(args.tmpdir.path)) {
    const relPath = path.relative(args.tmpdir.path, f)
    try {
      const mimeType = mime.contentType(mime.lookup(relPath) || CONTENT_TYPES.octetStream) as string;
      const tx = poolClient.bundlr.createTransaction(
        await fs.promises.readFile(path.resolve(f)),
        { tags: [...subTags, { name: TAGS.keys.contentType, value: mimeType }] }
      )
      await tx.sign();
      const id = tx.id;
      const cost = await poolClient.bundlr.getPrice(tx.size);
      fs.rmSync(path.resolve(f));
      try {
        await poolClient.bundlr.fund(cost.multipliedBy(1.1).integerValue());
      } catch (e: any) {
        exitProcess(`Error funding bundlr - stopping process\n ${e}`, 1)
      }
      await tx.upload();
      if (!id) { throw new Error("Upload Error") }
      additionalMediaPaths[relPath] = { id: id };
    } catch (e: any) {
      fs.rmSync(path.resolve(f));
      exitProcess(`Error uploading ${f} for ${args.tweet.id_str} - ${e}`, 1);
    }
  }

  return additionalMediaPaths;
}

async function processMedia(poolClient: PoolClient, args: {
  tweet: any,
  tmpdir: any,
  contentModeration: boolean
}) {
  if (args.tweet?.includes?.media?.length > 0) {
    try {
      const mediaDir = path.join(args.tmpdir.path, "media")
      if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir)
      }
      for (let i = 0; i < args.tweet.includes.media.length; i++) {
        const mediaObject = args.tweet.includes.media[i];
        const url = mediaObject.url;

        if (mediaObject && mediaObject.variants && (mediaObject.type === "video" || mediaObject.type === "animated_gif")) {
          const variants = mediaObject?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
          if (args.contentModeration) {
            let contentCheck = await shouldUploadContent(variants[0].url, mediaObject.type, poolClient.poolConfig);
            if (!contentCheck) {
              return;
            }
          }
          await processMediaURL(variants[0].url, mediaDir, i)
        } else {
          if (mediaObject.type === "photo" || mediaObject.type === "image") {
            if (args.contentModeration) {
              let contentCheck = await shouldUploadContent(url, "image", poolClient.poolConfig);
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
      exitProcess(`Error while archiving media: ${e}`, 1);
    }
  }
}

async function getTweetsfromIds(poolClient: IPoolClient, args: {
  ids: string[]
}) {
  let allTweets: any[] = [];
  for (let j = 0; j < args.ids.length; j += 10) {
    const splitIds: string[] = args.ids.slice(j, j + 10);

    let tweets = await poolClient.twitterV2.v2.tweets(splitIds, LOOKUP_PARAMS);
    if (tweets.data.length > 0) {
      allTweets = allTweets.concat(tweets);
    };
  }
  return allTweets;
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
async function isDuplicate(poolClient: IPoolClient, args: { tweet: any }) {
  let tName = generateAssetName(args.tweet);

  const query = () => gql.query({
    operation: "transactions",
    variables: {
      tags: {
        value: [{
          name: "Artifact-Name",
          values: [tName]
        }, {
          name: "Pool-Id",
          values: [poolClient.poolConfig.contracts.pool.id]
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

export function generateAssetName(tweet: any) {
  if (tweet) {
    if (tweet.text) {
      if (tweet.text.length > 30) {
        return `Username: ${tweet.user.name}, Tweet: ${truncateString(tweet.text, 30)}`
      } else {
        return `Username: ${tweet.user.name}, Tweet: ${tweet.text}`
      }
    } else if (tweet.full_text) {
      if (tweet.full_text.length > 30) {
        return `Username: ${tweet.user.name}, Tweet: ${truncateString(tweet.full_text, 30)}`
      } else {
        return `Username: ${tweet.user.name}, Tweet: ${tweet.full_text}`
      }
    } else {
      return `Username: ${tweet.user.name}, Tweet: ${tweet.id}`
    }
  }
  else {
    return 'Username: unknown'
  }
}

// Delete the stream rules before and after this run.
// Before to clear out any previous leftovers from failed runs
export async function deleteStreamRules(poolClient: IPoolClient) {
  const rules = await poolClient.twitterV2Bearer.v2.streamRules();

  if (rules.data?.length) {
    await poolClient.twitterV2Bearer.v2.updateStreamRules({
      delete: { ids: rules.data.map(rule => rule.id) },
    });
  }
}