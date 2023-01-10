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
} from "../../../config/utils";
import { createAsset } from "../../assets";
import { TAGS, LOOKUP_PARAMS, CONTENT_TYPES } from "../../../config";
import { ArtifactEnum, IPoolClient } from "../../../config/types";
import { shouldUploadContent } from "../moderator";
import { conversationEndpoint } from "../../../config/endpoints";

const arClient = new ArweaveClient();

// Fetch 10 at a time for rate limit and speed
// Converts v2 tweets to v1
export async function processIdsV2(poolClient: IPoolClient, args: {
  ids: string[],
  contentModeration: boolean
}) {
  let tweets = await getTweetsfromIds(poolClient, { ids: args.ids });

  for (const tweet of tweets) {
    // let dup = await isDuplicate(poolClient, { tweet: tweet });
    // if (!dup) { // TODO - uncomment dup
    await processThreadV2(poolClient, {
      tweet: tweet,
      contentModeration: args.contentModeration
    });
    // }
    // else {
    //   console.log(clc.red(`Tweet already mined: ${generateAssetName(tweet)}`));
    // }
  }
}

/** 
 * Take one tweet as argument, check if it is part of a conversation
 * Get thread tweets and run processTweetV2 with associationId - conversationId
 * If tweet is not part of a thread, run processTweetV2 with associationId - null
**/
export async function processThreadV2(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean
}) {
  if (!args.tweet.conversation_id) {
    return;
  }

  const thread = await getThread(poolClient, {
    conversationId: args.tweet.conversation_id
  });

  if (thread && thread.length > 0) {
    let associationId: string | null = null;
    let associationSequence: string | null = "0";

    const childTweets = await getTweetsfromIds(poolClient, { ids: thread.map((tweet: any) => tweet.id) });

    associationId = args.tweet.conversation_id;

    processTweetV2(poolClient, {
      tweet: args.tweet,
      contentModeration: args.contentModeration,
      associationId: associationId,
      associationSequence: associationSequence
    });

    let i = 1;
    const intervalId = setInterval(() => {
      if (i <= childTweets.length) {
        processTweetV2(poolClient, {
          tweet: childTweets[i - 1],
          contentModeration: args.contentModeration,
          associationId: associationId,
          associationSequence: i.toString()
        });
        i++;
      }
      else {
        clearInterval(intervalId);
      }
    }, 1500);
  }
  else {
    processTweetV2(poolClient, {
      tweet: args.tweet,
      contentModeration: args.contentModeration,
      associationId: null,
      associationSequence: null
    });
  }
}

export async function processTweetV2(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean,
  associationId: string | null,
  associationSequence: string | null
}) {

  const tmpdir = await tmp.dir({ unsafeCleanup: true });

  await processProfileImage({
    tweet: args.tweet,
    tmpdir: tmpdir
  });

  const profileImagePath = await processMediaPaths(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    path: "profile"
  });

  await processMedia(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    contentModeration: args.contentModeration
  });

  const additionalMediaPaths = await processMediaPaths(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    path: "media"
  });

  if (tmpdir) {
    await tmpdir.cleanup()
  }

  await createAsset(poolClient, {
    index: { path: "tweet.json" },
    paths: (assetId: string) => ({ "tweet.json": { id: assetId } }),
    content: args.tweet,
    contentType: CONTENT_TYPES.json,
    artifactType: ArtifactEnum.Messaging,
    name: generateAssetName(args.tweet),
    description: generateAssetName(args.tweet),
    type: TAGS.values.ansTypes.socialPost,
    additionalMediaPaths: additionalMediaPaths,
    profileImagePath: profileImagePath,
    associationId: args.associationId,
    associationSequence: args.associationSequence,
    title: null
  });
}

async function getThread(poolClient: IPoolClient, args: {
  conversationId: string
}) {

  const response = await axios.get(conversationEndpoint(args.conversationId), {
    headers: {
      Authorization: `Bearer ${poolClient.poolConfig.twitterApiKeys.bearer_token}`
    }
  });

  if (response.data && response.data.data && response.data.data.length > 0) {
    return response.data.data.reverse(); // Conversation Id Tweets are returned in reverse chronological order
  }

  return null
}

async function getTweetsfromIds(poolClient: IPoolClient, args: { ids: string[] }) {
  let allTweets: any[] = [];

  for (let j = 0; j < args.ids.length; j += 10) {
    const splitIds: string[] = args.ids.slice(j, j + 10);

    let tweets = await poolClient.twitterV2.v2.tweets(splitIds, LOOKUP_PARAMS);
    if (tweets.data.length > 0) {
      for (let i = 0; i < tweets.data.length; i++) {
        allTweets.push({
          ...tweets.data[i],
          user: getUser(tweets.data[i].author_id, tweets.includes.users),
          includes: {
            media: tweets.data[i].attachments?.media_keys ?
              getMedia(tweets.data[i].attachments.media_keys, tweets.includes.media) : []
          }
        })
      }
    }
  }
  return allTweets;
}

async function processProfileImage(args: {
  tweet: any,
  tmpdir: any
}) {
  const profileDir = path.join(args.tmpdir.path, "profile");

  if (!await checkPath(profileDir)) {
    await mkdir(profileDir)
  }
  
  if (args.tweet?.user?.profile_image_url) {
    await processMediaURL(args.tweet.user.profile_image_url, profileDir, 0);
  }
}

async function processMedia(poolClient: PoolClient, args: {
  tweet: any,
  tmpdir: any,
  contentModeration: boolean
}) {
  if (args.tweet?.includes?.media?.length > 0) {
    try {
      const mediaDir = path.join(args.tmpdir.path, "media");
      if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir);
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
          await processMediaURL(variants[0].url, mediaDir, i);
        } else {
          if (mediaObject.type === "photo" || mediaObject.type === "image") {
            if (args.contentModeration) {
              let contentCheck = await shouldUploadContent(url, "image", poolClient.poolConfig);
              if (!contentCheck) {
                return;
              }
            }
            await processMediaURL(url, mediaDir, i);
          }
        }
      }
    }
    catch (e: any) {
      exitProcess(`Error while archiving media: ${e}`, 1);
    }
  }
}

async function processMediaPaths(poolClient: IPoolClient, args: {
  tweet: any,
  tmpdir: any,
  path: string
}) {
  const subTags = [
    { name: TAGS.keys.application, value: TAGS.values.application },
    { name: TAGS.keys.tweetId, value: `${args.tweet.id ?? "unknown"}` }
  ]
  const additionalMediaPaths: { [key: string]: any } = {};
  const dir = `${args.tmpdir.path}/${args.path}`;

  if (await checkPath(dir)) {
    for await (const f of walk(dir)) {
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
        }
        catch (e: any) {
          exitProcess(`Error funding bundlr - stopping process\n ${e}`, 1)
        }
        await tx.upload();
        if (!id) exitProcess(`Upload Error`, 1);
        additionalMediaPaths[relPath] = { id: id };
      } catch (e: any) {
        fs.rmSync(path.resolve(f));
        exitProcess(`Error uploading ${f} for ${args.tweet.id} - ${e}`, 1);
      }
    }
  }

  return additionalMediaPaths;
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

function getUser(authorId: string, users: any[]) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === authorId) {
      return users[i];
    }
  }
  return null;
}

function getMedia(mediaKeys: string[], mediaObjects: any[]) {
  const mediaByTweet: any[] = [];
  for (let i = 0; i < mediaObjects.length; i++) {
    if (mediaKeys.includes(mediaObjects[i].media_key)) {
      mediaByTweet.push(mediaObjects[i]);
    }
  }
  return mediaByTweet;
}