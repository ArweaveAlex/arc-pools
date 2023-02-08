
import axios from "axios";
import tmp from "tmp-promise";
import * as path from "path";
import { mkdir } from "fs/promises";

import { PoolClient } from "../../../clients/pool";

import {
  log,
  logValue,
  checkPath,
  processMediaURL,
  exitProcess,
  generateAssetName,
  generateAssetDescription,
  processMediaPaths
} from "../../../helpers/utils";
import { createAsset } from "../..";
import { TAGS, LOOKUP_PARAMS, CONTENT_TYPES, RENDER_WITH_VALUE } from "../../../helpers/config";
import { ArtifactEnum, IPoolClient } from "../../../helpers/types";
import { shouldUploadContent } from "../moderator";
import { conversationEndpoint } from "../../../helpers/endpoints";
import { tmpdir } from "os";

let totalCount: number = 0;

export async function processIdsV2(poolClient: IPoolClient, args: {
  ids: string[],
  contentModeration: boolean
}) {
  logValue(`Parent Id Count`, args.ids.length.toString(), 0);
  const tweets: any[] = await getTweetsfromIds(poolClient, { ids: args.ids });

  for (let i = 0; i < tweets.length; i++) {
    const isDup = await poolClient.arClient.isDuplicate({
        artifactName: generateAssetName(tweets[i]),
        poolId: poolClient.poolConfig.contracts.pool.id
    });

    if (!isDup) {
      await processThreadV2(poolClient, {
        tweet: tweets[i],
        contentModeration: args.contentModeration
      })
    }
    else {
      log(`Asset already mined: ${generateAssetName(tweets[i])}`, 1);
    }
  }
  logValue(`Total Count Mined`, totalCount, 0);
}

/** 
 * Take one tweet as argument, check if it is part of a conversation
 * Get thread tweets and run processTweetV2 with associationId - conversationId
 * If tweet is not part of a thread, run processTweetV2 with associationId - null
**/
export async function processThreadV2(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean,
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

    const threadTweets = await getTweetsfromIds(poolClient, { ids: thread.map((tweet: any) => tweet.id) });

    associationId = args.tweet.conversation_id;

    await processTweetV2(poolClient, {
      tweet: args.tweet,
      contentModeration: args.contentModeration,
      associationId: associationId,
      associationSequence: associationSequence
    });

    for (let i = 0; i < threadTweets.length; i++) {
      await processTweetV2(poolClient, {
        tweet: threadTweets[i],
        contentModeration: args.contentModeration,
        associationId: associationId,
        associationSequence: (i + 1).toString()
      });
    }
  }
  else {
    await processTweetV2(poolClient, {
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
  associationSequence: string | null,
}) {

  const tmpdir = await tmp.dir({ unsafeCleanup: true });

  const referencedTweets = await processReferences(poolClient, {
    tweet: args.tweet,
    contentModeration: args.contentModeration,
    tmpdir: tmpdir
  });

  await processProfileImage({
    tweet: args.tweet,
    tmpdir: tmpdir
  });
  
  const profileImagePath = await processMediaPathsLocal(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    path: "profile"
  });

  await processMedia(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    contentModeration: args.contentModeration
  });

  const additionalMediaPaths = await processMediaPathsLocal(poolClient, {
    tweet: args.tweet,
    tmpdir: tmpdir,
    path: "media"
  });

  if (tmpdir) {
    await tmpdir.cleanup()
  }

  const contractId = await createAsset(poolClient, {
    index: { path: "tweet.json" },
    paths: (assetId: string) => ({ "tweet.json": { id: assetId } }),
    content: args.tweet,
    contentType: CONTENT_TYPES.json,
    artifactType: ArtifactEnum.Messaging,
    name: generateAssetName(args.tweet),
    description: generateAssetDescription(args.tweet),
    type: TAGS.values.ansTypes.socialPost,
    additionalMediaPaths: additionalMediaPaths,
    profileImagePath: profileImagePath,
    associationId: args.associationId,
    associationSequence: args.associationSequence,
    childAssets: referencedTweets,
    renderWith: RENDER_WITH_VALUE,
    assetId: args.tweet.id
  });

  if (contractId) {
    totalCount++;
    return contractId;
  }
}

async function getTweetsfromIds(poolClient: IPoolClient, args: { ids: string[] }) {
  const allTweets: any[] = [];

  for (let i = 0; i < args.ids.length; i += 100) {
    const splitIds: string[] = args.ids.slice(i, i + 100);

    try {
      logValue(`Fetching from API`, splitIds.length, 0);
      const tweets = await poolClient.twitterV2.v2.tweets(splitIds, LOOKUP_PARAMS);
      if (tweets.data && tweets.data.length > 0) {
        for (let j = 0; j < tweets.data.length; j++) {
          allTweets.push({
            ...tweets.data[j],
            user: getUser(tweets.data[j].author_id, tweets.includes.users),
            includes: {
              media: tweets.data[j].attachments?.media_keys ?
                getMedia(tweets.data[j].attachments.media_keys, tweets.includes.media) : []
            }
          })
        }
      }
      else {
        if (tweets.errors) {
          for (let k = 0; k < tweets.errors.length; k++) {
            log(tweets.errors[k].detail, 1);
          }
        }
        else {
          log(`Error fetching tweets`, 1);
        }
      }
    }
    catch (e: any) {
      log(`${e}`, 1);
    }
  }
  return allTweets;
}

async function getThread(poolClient: IPoolClient, args: {
  conversationId: string
}) {
  let paginationToken: string | null = null;
  let allTweets: any[] = [];

  do {
    const response = await axios.get(conversationEndpoint(
      args.conversationId, 
      paginationToken
    ), {
      headers: {
        Authorization: `Bearer ${poolClient.poolConfig.twitterApiKeys.bearer_token}`
      }
    });

    /* Conversation Id Tweets are returned in reverse chronological order */
    if (response.data.data) allTweets = allTweets.concat(response.data.data).reverse();
    logValue(`Thread`, `${args.conversationId} - ${allTweets.length}`, 0);

    if (response.data.meta && response.data.meta.next_token) {
      paginationToken = response.data.meta.next_token;
    }
    else {
      paginationToken = null;
    }
  }
  while (paginationToken);

  return allTweets;
}

async function processReferences(poolClient: IPoolClient, args: {
  tweet: any,
  contentModeration: boolean,
  tmpdir: any
}) {
  const referencedTweets: any[] = []
  if (args.tweet && args.tweet.referenced_tweets) {
    for (let i = 0; i < args.tweet.referenced_tweets.length; i++) {
      if (args.tweet.referenced_tweets[i].type && args.tweet.referenced_tweets[i].type === "quoted") {
        logValue(`Reference`, args.tweet.referenced_tweets[i].id, 0);
        const fetchedTweets: any[] = await getTweetsfromIds(poolClient, { ids: [args.tweet.referenced_tweets[i].id] });

        for (let j = 0; j < fetchedTweets.length; j++) {
          const contractId = await processTweetV2(poolClient, {
            tweet: fetchedTweets[j],
            contentModeration: args.contentModeration,
            associationId: null,
            associationSequence: null,
          })

          referencedTweets.push(contractId);
        }
      }
    }
  }

  return referencedTweets;
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
    try {
      await processMediaURL(args.tweet.user.profile_image_url, profileDir, 0);
    }
    catch (e) {
      log(e, 1);
    }
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

async function processMediaPathsLocal(poolClient: IPoolClient, args: {
  tweet: any,
  tmpdir: any,
  path: string
}) {
  const subTags = [
    { name: TAGS.keys.application, value: TAGS.values.application },
    { name: TAGS.keys.tweetId, value: `${args.tweet.id ?? "unknown"}` }
  ]
  let additionalMediaPaths = await processMediaPaths(poolClient, {
    subTags: subTags,
    tmpdir: tmpdir,
    path: args.path
  });
  return additionalMediaPaths;
}

/**
 * Delete the stream rules before and after this run
 * Before to clear out any previous leftovers from failed runs 
**/
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

export function modifyStreamTweet(tweet: any) {
  return {
    ...tweet.data,
    user: getUser(tweet.data.author_id, tweet.includes.users),
    includes: {
      media: tweet.data.attachments?.media_keys ?
        getMedia(tweet.data.attachments.media_keys, tweet.includes.media) : []
    }
  }
}