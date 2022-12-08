import fs from "fs";
import axios from "axios";
import clc from "cli-color";
import * as path from "path";
import mime from "mime-types";
import tmp from "tmp-promise";
import minimist from "minimist";
import { mkdir } from "fs/promises";
import * as gql from "gql-query-builder";

import Bundlr from "@bundlr-network/client";
import { Contract, LoggerFactory } from "warp-contracts";
import {
    TwitterApi,
    Tweetv2SearchParams,
    TweetV2UserTimelineParams,
    TweetStream,
    TweetSearchV2StreamParams,
    TTweetv2Expansion,
    TTweetv2MediaField,
    TTweetv2PlaceField,
    TTweetv2PollField,
    TTweetv2TweetField,
    TTweetv2UserField
} from "twitter-api-v2";
const Twitter = require("node-tweet-stream");

import { createAsset, generateTweetName } from "../assets";
import { checkPath, walk, processMediaURL } from ".";
import { ArweaveClient } from "../../arweave-client";
import { exitProcess } from "../../utils";
import { PoolConfigType } from "../../types";
import { CLI_ARGS } from "../../config";
import { shouldUploadContent } from "./moderator";

const arClient = new ArweaveClient();

let lockProcess = false;
let poolConfig: PoolConfigType;
let bundlr: Bundlr
let keys: any;
let contract: Contract;
let twitter: any;
let twitterV2: TwitterApi;
let twitterV2Bearer: TwitterApi;
let contentModeration: boolean;


export async function run(config: PoolConfigType, argv: minimist.ParsedArgs) {
    poolConfig = config;

    try {
        keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
    }
    catch {
        exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    twitter = new Twitter({
        consumer_key: poolConfig.twitterApiKeys.consumer_key,
        consumer_secret: poolConfig.twitterApiKeys.consumer_secret,
        token: poolConfig.twitterApiKeys.token,
        token_secret: poolConfig.twitterApiKeys.token_secret,
        tweet_mode: "extended"
    });

    twitterV2Bearer = new TwitterApi(poolConfig.twitterApiKeys.bearer_token);

    bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", keys);

    contract = arClient.warp.contract(poolConfig.contracts.pool.id);

    LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
    LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
    LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");

    twitterV2 = new TwitterApi({
        appKey: poolConfig.twitterApiKeys.consumer_key,
        appSecret: poolConfig.twitterApiKeys.consumer_secret,
        accessToken: poolConfig.twitterApiKeys.token,
        accessSecret: poolConfig.twitterApiKeys.token_secret,
    });

    const method = argv["method"];
    const mentionTag = argv["mention-tag"];
    const username = argv["username"];
    const cMod = argv["content-moderation"];

    contentModeration = cMod;

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


// Start a twitter stream, process to arweave one by one
async function mineTweetsByStream() {
    console.log("Mining tweets by stream...")
    let stream: TweetStream;
    try {
        await deleteStreamRules();
        stream = twitterV2Bearer.v2.searchStream({ ...streamParams, autoConnect: false });

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
            let finalTweet: any = {}
            finalTweet = tweet.data;
            if(!finalTweet.full_text) {
                finalTweet.full_text = tweet.data.text;
            }
            finalTweet.includes = tweet.includes;
            for (let i = 0; i < tweet.includes.users.length; i++) {
                if (tweet.includes.users[i].id === tweet.data.author_id) {
                    let user = tweet.includes.users[i];
                    user.screen_name = user.username;
                    finalTweet.user = user;
                }
            }

            await processTweetV2(finalTweet);
        }

    }
    catch (e: any) {
        stream.close()
        console.log("Twitter mining failed error: ");
        console.log(e);
        process.exit(1);
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
        // grab all the mentions from twitter
        let query = mentionTag;
        let r: any;
        let allTweets: any[] = [];
        do {
            let params: Tweetv2SearchParams = {
                max_results: 100,
                query: query,
                "tweet.fields": ['referenced_tweets']
            };
            if (r) params.next_token = r.meta.next_token;
            r = await twitterV2.v2.search(
                query,
                params
            );
            if (r.data.data) allTweets = allTweets.concat(r.data.data);
        } while (r.meta.next_token);

        console.log(allTweets);

        // get the parent tweets from the mentions above
        // and remove duplicate ids
        let ids = allTweets.map((t: any) => {
            if (t.referenced_tweets && t.referenced_tweets.length > 0) {
                return t.referenced_tweets[0].id;
            }
        }).filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });

        console.log(ids);

        await processIds(ids);
    } catch (e: any) {
        console.log(e.data);
    }
}

/*
 * mine all of a specific users tweets
 * ignoring duplicates
 * @param username: string 
 */
async function mineTweetsByUser(username: string) {
    console.log(`Mining Tweets by user ...`);
    console.log(`User - [`, clc.green(`'${username}'`), `]`);
    let user: any;
    try {
        user = await twitterV2.v2.userByUsername(username);
        console.log(`User ID - [`, clc.green(`'${user.data.id}'`), `]`);
    }
    catch {
        exitProcess(`User not found`, 1)
    }

    if (user) {
        let uid = user.data.id;

        let r: any;
        let allTweets: any[] = [];
        do {
            let params: TweetV2UserTimelineParams = {
                max_results: 100
            };
            if (r) params.pagination_token = r.meta.next_token;

            r = await twitterV2.v2.userTimeline(
                uid,
                params
            );
            if (r.data.data) allTweets = allTweets.concat(r.data.data);
        } while (r.meta.next_token);

        console.log(`${allTweets.length} tweets fetched`);

        let ids = allTweets.map((t: any) => {
            return t.id
        });

        console.log(ids);
        await processIds(ids);
    }
}

// fetch 10 at a time for rate limit and speed
// converts v2 tweets to v1
async function processIds(ids: string[]) {
    // aggregate 10 parent tweets at once
    let allTweets: any[] = [];
    for (var j = 0; j < ids.length; j += 10) {
        // console.log("Fetching tweet ids: " + ids.slice(j, j + 10));
        let rParents = await twitterV2.v1.tweets(ids.slice(j, j + 5));
        if (rParents.length > 0) {
            allTweets = allTweets.concat(rParents)
        };
    }

    for (let j = 0; j < allTweets.length; j++) {
        let dup = await isDuplicate(allTweets[j]);
        if (!dup) {
            let t = allTweets[j];
            if (!t.text) t.text = t.full_text;
            await processTweet(t);
        } else {
            console.log("Tweet already mined skipping: " + generateTweetName(allTweets[j]))
        }
    }
}

async function isDuplicate(tweet: any) {
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


async function processTweet(tweet: any) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });

    try {
        if (tweet?.extended_entities?.media?.length > 0) {
            try {
                const mediaDir = path.join(tmpdir.path, "media")
                if (!await checkPath(mediaDir)) {
                    await mkdir(mediaDir)
                }
                for (let i = 0; i < tweet.extended_entities.media.length; i++) {
                    const mobj = tweet.extended_entities.media[i]
                    const url = mobj.media_url
                    if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.video_info?.variants) {
                        const variants = mobj?.video_info?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
                        await processMediaURL(variants[0].url, mediaDir, i)
                    } else {
                        await processMediaURL(url, mediaDir, i)
                    }
                }
            } catch (e: any) {
                console.error(`while archiving media: ${e.stack}`)
            }

        }

        if (tweet.entities.urls?.length > 0) {
            try {
                for (let i = 0; i < tweet.entities.urls.length; i++) {
                    const u = tweet.entities.urls[i]
                    const url = u.expanded_url
                    // tweets sometimes reference themselves
                    if (url === `https://twitter.com/i/web/status/${tweet.id}`) {
                        continue;
                    }
                    const headres = await axios.head(url).catch((e) => {
                        console.log(`heading ${url} - ${e.message}`)
                    })
                    if (!headres) { continue }
                    const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html"
                    const linkPath = path.join(tmpdir.path, `/links/${i}`)
                    if (!await checkPath(linkPath)) {
                        await mkdir(linkPath, { recursive: true })
                    }
                    // if it links a web page:
                    if (contentType === "text/html") {
                        // add to article DB.
                        // await article.addUrl(url)
                    } else {
                        await processMediaURL(url, linkPath, i)
                    }
                }
            } catch (e: any) {
                console.error(`While processing URLs: ${e.stack ?? e.message}`)
            }

        }

        const subTags = [
            { name: "Application", value: "TwittAR" },
            { name: "Tweet-ID", value: `${tweet.id ?? "unknown"}` }
        ]

        const additionalPaths: { [key: string]: any } = { "": "" };

        for await (const f of walk(tmpdir.path)) {
            const relPath = path.relative(tmpdir.path, f)
            try {
                const mimeType = mime.contentType(mime.lookup(relPath) || "application/octet-stream") as string;
                const tx = bundlr.createTransaction(
                    await fs.promises.readFile(path.resolve(f)),
                    { tags: [...subTags, { name: "Content-Type", value: mimeType }] }
                )
                await tx.sign();
                const id = tx.id;
                const cost = await bundlr.getPrice(tx.size);
                // console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                // console.log("Bundlr subpath upload id for tweet: " + id);
                fs.rmSync(path.resolve(f));
                try {
                    await bundlr.fund(cost.multipliedBy(1.1).integerValue());
                } catch (e: any) {
                    console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
                    process.exit(1);
                }
                await tx.upload();
                if (!id) { throw new Error("Upload Error") }
                additionalPaths[relPath] = { id: id };
            } catch (e: any) {
                fs.rmSync(path.resolve(f));
                console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`)
                continue
            }
        }

        try {
            if (tmpdir) {
                await tmpdir.cleanup()
            }

            await createAsset(
                bundlr,
                contract,
                tweet,
                additionalPaths,
                poolConfig,
                "application/json",
                ""
            );
        } catch (e: any) {
            console.log(`Error creating asset stopping processing...\n ${e}`);
            process.exit(1);
        }
    } catch (e: any) {
        console.log(`general error: ${e.stack ?? e.message}`)
        if (tmpdir) {
            await tmpdir.cleanup()
        }
    }
}

async function processTweetV2(tweet: any) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });
    try {
        if (tweet?.includes?.media?.length > 0) {
            try {
                const mediaDir = path.join(tmpdir.path, "media")
                if (!await checkPath(mediaDir)) {
                    await mkdir(mediaDir)
                }
                for (let i = 0; i < tweet.includes.media.length; i++) {
                    const mobj = tweet.includes.media[i];
                    const url = mobj.url;
                    if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.variants) {
                        const variants = mobj?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
                        if (contentModeration) {
                            let s = await shouldUploadContent(variants[0].url, mobj.type, poolConfig);
                            if(!s){
                                console.log("ignoring explicit");
                                return;
                            }
                        }
                        await processMediaURL(variants[0].url, mediaDir, i)
                    } else if (mobj.type === "photo" || mobj.type === "image") {
                        if (contentModeration) {
                            let s = await shouldUploadContent(url, "image", poolConfig);
                            if(!s){
                                console.log("ignoring explicit");
                                return;
                            }
                        }
                        await processMediaURL(url, mediaDir, i)
                    }
                }
            } catch (e: any) {
                console.error(`while archiving media: ${e}`)
                console.log(e);
            }

        }

        if (tweet.entities.urls?.length > 0) {
            try {
                for (let i = 0; i < tweet.entities.urls.length; i++) {
                    const u = tweet.entities.urls[i]
                    const url = u.expanded_url
                    // tweets sometimes reference themselves
                    if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
                        continue;
                    }
                    const headres = await axios.head(url).catch((e) => {
                        console.log(`heading ${url} - ${e.message}`)
                    })
                    if (!headres) { continue }
                    const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html"
                    const linkPath = path.join(tmpdir.path, `/links/${i}`)
                    if (!await checkPath(linkPath)) {
                        await mkdir(linkPath, { recursive: true })
                    }
                    // if it links a web page:
                    if (contentType === "text/html") {
                        // add to article DB.
                        // await article.addUrl(url)
                    } else {
                        await processMediaURL(url, linkPath, i)
                    }
                }
            } catch (e: any) {
                console.error(`While processing URLs: ${e.stack ?? e.message}`)
            }

        }

        const subTags = [
            { name: "Application", value: "TwittAR" },
            { name: "Tweet-ID", value: `${tweet.id_str ?? "unknown"}` }
        ]

        const additionalPaths: { [key: string]: any } = { "": "" };

        for await (const f of walk(tmpdir.path)) {
            const relPath = path.relative(tmpdir.path, f)
            try {
                const mimeType = mime.contentType(mime.lookup(relPath) || "application/octet-stream") as string;
                const tx = bundlr.createTransaction(
                    await fs.promises.readFile(path.resolve(f)),
                    { tags: [...subTags, { name: "Content-Type", value: mimeType }] }
                )
                await tx.sign();
                const id = tx.id;
                const cost = await bundlr.getPrice(tx.size);
                // console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                // console.log("Bundlr subpath upload id for tweet: " + id);
                fs.rmSync(path.resolve(f));
                try {
                    await bundlr.fund(cost.multipliedBy(1.1).integerValue());
                } catch (e: any) {
                    console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
                    process.exit(1);
                }
                await tx.upload();
                if (!id) { throw new Error("Upload Error") }
                additionalPaths[relPath] = { id: id };
            } catch (e: any) {
                fs.rmSync(path.resolve(f));
                console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`)
                continue
            }
        }

        try {
            if (tmpdir) {
                await tmpdir.cleanup()
            }

            await createAsset(
                bundlr,
                contract,
                tweet,
                additionalPaths,
                poolConfig,
                "application/json",
                ""
            );
        } catch (e: any) {
            console.log(`Error creating asset stopping processing...\n ${e}`);
            process.exit(1);
        }
    } 
    catch (e: any) {
        console.log(`general error: ${e.stack ?? e.message}`)
        if (tmpdir) {
            await tmpdir.cleanup()
        }
    }
}

let expansions: TTweetv2Expansion[] = ['attachments.poll_ids', 'attachments.media_keys', 'author_id', 'referenced_tweets.id', 'in_reply_to_user_id', 'edit_history_tweet_ids', 'geo.place_id', 'entities.mentions.username', 'referenced_tweets.id.author_id']
let mediaFields: TTweetv2MediaField[] = ['duration_ms', 'height', 'media_key', 'preview_image_url', 'type', 'url', 'width', 'public_metrics', 'non_public_metrics', 'organic_metrics', 'alt_text', 'variants']
let placeFields: TTweetv2PlaceField[] = ['contained_within', 'country', 'country_code', 'full_name', 'geo', 'id', 'name', 'place_type']
let pollFields: TTweetv2PollField[] = ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status']
let tweetFields: TTweetv2TweetField[] = ['attachments', 'author_id', 'context_annotations', 'conversation_id', 'created_at', 'entities', 'geo', 'id', 'in_reply_to_user_id', 'lang', 'public_metrics', 'non_public_metrics', 'promoted_metrics', 'organic_metrics', 'edit_controls', 'possibly_sensitive', 'referenced_tweets', 'reply_settings', 'source', 'text', 'withheld']
let userFields: TTweetv2UserField[] = ['created_at', 'description', 'entities', 'id', 'location', 'name', 'pinned_tweet_id', 'profile_image_url', 'protected', 'public_metrics', 'url', 'username', 'verified', 'withheld']

let streamParams = {
    'expansions': expansions,
    'media.fields': mediaFields,
    'place.fields': placeFields,
    'poll.fields': pollFields,
    'tweet.fields': tweetFields,
    'user.fields': userFields,
    backfill_minutes: 0
}