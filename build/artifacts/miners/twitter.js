"use strict";
// import Bundlr from "@bundlr-network/client";
// import tmp from "tmp-promise";
// import * as p from "path";
// import { mkdir } from "fs/promises";
// import axios from "axios";
// import Arweave from "arweave";
// import mime from "mime-types";
// import { Contract, LoggerFactory, Warp, WarpNodeFactory } from "warp-contracts";
// import { readFileSync, promises } from "fs";
// import { TwitterApi, Tweetv2SearchParams, Tweetv2FieldsParams, TweetV2UserTimelineParams } from "twitter-api-v2";
// import * as gql from "gql-query-builder";
// const Twitter = require("node-tweet-stream");
exports.__esModule = true;
exports.run = void 0;
// let lockProcess = false;
// let twitter: any;
// let bundlr: Bundlr
// let config: Config;
// let keys: any;
// let arweave: Arweave;
// let smartweave: Warp;
// let contract: Contract;
// let tweets: any[] = [];
// let twitterClientV2: TwitterApi;
function run(poolConfig) {
    console.log("Run Twitter");
    console.log(poolConfig);
}
exports.run = run;
// async function init(poolSlug: string) {
//     config = JSON.parse(readFileSync(POOLS_PATH).toString())[poolSlug];
//     if(!config) throw new Error("Invalid pool slug");
//     keys = JSON.parse(readFileSync(config.walletPath).toString());
//     twitter = new Twitter({
//         consumer_key: keys.tkeys.consumer_key,
//         consumer_secret: keys.tkeys.consumer_secret,
//         token: keys.tkeys.token,
//         token_secret: keys.tkeys.token_secret,
//         tweet_mode: "extended"
//     })
//     bundlr = new Bundlr(config.bundlrNode, "arweave", keys.arweave);
//     console.log("Bundlr balance", (await bundlr.getLoadedBalance()).toString());
//     console.log(`Loaded with account address: ${bundlr.address}`)
//     arweave = Arweave.init({
//         host: "arweave.net",
//         port: 443,
//         protocol: "https"
//     });
//     smartweave = WarpNodeFactory.memCachedBased(arweave).useArweaveGateway().build();
//     contract = smartweave.contract(config.pool.contract).setEvaluationOptions({
//         walletBalanceUrl: config.balanceUrl
//     });
//     LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
//     LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
//     LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");
//     twitterClientV2 = new TwitterApi({
//         appKey: keys.tkeys.consumer_key,
//         appSecret: keys.tkeys.consumer_secret,
//         accessToken: keys.tkeys.token,
//         accessSecret: keys.tkeys.token_secret,
//     });
// }
// /**
//  * Start a twitter stream, aggregate them into a list
//  * then mine them onto Arweave synchronously so if it 
//  * fails in the middle we don't end up with partial
//  * atomic assets
//  * @param poolSlug 
//  */
// export async function mineTweets(poolSlug: string) {
//     await init(poolSlug);
//     twitter.on('tweet', listTweet);
//     twitter.on('error', (e: any) => {
//         console.error(`tStream error: ${e}`)
//     })
//     const trackKeyWords = config.keywords
//     const trackUsers = config.userIDs
//     console.log(`Tracking key words: ${trackKeyWords}`);
//     console.log(`Tracking users: ${trackUsers}`)
//     twitter.track(trackKeyWords)
//     twitter.follow(trackUsers)
//     setTimeout(() => {lockProcess = true; processTweets();}, 20000);
// }
// /**
//  * If someone says @thealexarchive #crypto etc...
//  * this will grab those and mine them to the pool
//  * @param poolSlug 
//  */
// export async function mineTweetsByMention(
//     poolSlug: string,
//     mentionTag: string
// ) {
//     await init(poolSlug);
//     console.log("Running mining process for mentions...");
//     console.log(mentionTag);
//     try {
//         // grab all the mentions from twitter
//         let query = mentionTag;
//         let r: any;
//         let allTweets: any[] = [];
//         do {
//             let params: Tweetv2SearchParams = {
//                 max_results: 100,
//                 query: query,
//                 "tweet.fields": ['referenced_tweets']
//             };
//             if(r) params.next_token = r.meta.next_token;
//             r = await twitterClientV2.v2.search(
//                 query,
//                 params
//             );
//             if(r.data.data) allTweets = allTweets.concat(r.data.data);
//         } while(r.meta.next_token);
//         // get the parent tweets from the mentions above
//         // and remove duplicate ids
//         let ids = allTweets.map((t: any) => { 
//             if(t.referenced_tweets && t.referenced_tweets.length > 0) {
//                 return t.referenced_tweets[0].id;
//             }
//         }).filter(function(item, pos, self) {
//             return self.indexOf(item) == pos;
//         });
//         console.log(ids);
//         await processIds(ids);
//     } catch (e: any) {
//         console.log(e.data);
//     }
// }
// /**
//  * mine all of a specific users tweets
//  * ignoring duplicates
//  * @param poolSlug 
//  */
// export async function mineTweetsByUser(
//     poolSlug: string,
//     userName: string
// ) {
//     await init(poolSlug);
//     let user = await twitterClientV2.v2.userByUsername(userName);
//     console.log("Running mining process for user...");
//     console.log(userName);
//     console.log(user.data.id);
//     let uid = user.data.id;
//     let r: any;
//     let allTweets: any[] = [];
//     do {
//         let params: TweetV2UserTimelineParams = {
//             max_results: 100
//         };
//         if(r) params.pagination_token = r.meta.next_token;
//         r = await twitterClientV2.v2.userTimeline(
//             uid,
//             params
//         ); 
//         if(r.data.data) allTweets = allTweets.concat(r.data.data);
//     } while(r.meta.next_token);
//     console.log(allTweets.length + " tweets fetched");
//     let ids = allTweets.map((t: any) => { 
//         return t.id
//     });
//     console.log(ids);
//     await processIds(ids);
// }
// async function processIds(ids: string[]) {
//     // aggregate 10 parent tweets at once
//     let allTweets: any[] = [];
//     for (var j = 0; j < ids.length; j += 10) {
//         console.log("Fetching tweet ids: " + ids.slice(j, j + 10));
//         let rParents = await twitterClientV2.v1.tweets(ids.slice(j, j + 5));
//         if(rParents.length > 0) {
//             allTweets = allTweets.concat(rParents)
//         };
//     }
//     for(let j=0;j<allTweets.length;j++){
//         let dup = await isDuplicate(allTweets[j]);
//         if(!dup) {
//             let t = allTweets[j];
//             if(!t.text) t.text = t.full_text;
//             await processTweet(t);
//         } else {
//             console.log("Tweet already mined skipping: " + generateTweetName(allTweets[j]))
//         }
//     }
// }
// async function isDuplicate(tweet: any) {
//     let tName = generateTweetName(tweet);
//     const query = () => gql.query({
//         operation: "transactions",
//         variables: {
//             tags: {
//                 value: [{
//                     name: "Artifact-Name",
//                     values: [tName]
//                 }, {
//                     name: "Pool-Id",
//                     values: [config.pool.contract]
//                 }],
//                 type: "[TagFilter!]"
//             }
//         },
//         fields: [
//             {
//                 edges: [
//                     "cursor",
//                     {
//                         node: [
//                             "id",
//                             {
//                                 "tags": [
//                                     "name",
//                                     "value"
//                                 ]
//                             }
//                         ]
//                     }
//                 ]
//             }
//         ]
//     });
//     const response = await arweave.api.post("/graphql", query());
//     if(response.data && response.data.data) {
//         if(response.data.data.transactions){
//             if(response.data.data.transactions.edges){
//                 if(response.data.data.transactions.edges.length > 0){
//                     return true;
//                 }
//             }
//         }
//     }
//     return false;
// }
// async function listTweet(tweet: any) {
//     if (!tweet.retweeted_status && !lockProcess) {
//         console.log("Pushing new tweet: " + tweet);
//         tweets.push(tweet);
//     }
//     if(lockProcess){
//         twitter.on('tweet', () => {}); 
//     }
//     return;
// }
// async function processTweets(){
//     console.log(tweets.length);
//     for(let i=0;i<tweets.length;i++){
//         await processTweet(tweets[i]);
//     }
//     console.log("Finished processing all tweets...");
//     process.exit(1);
// }
// async function processTweet(tweet: any) {
//     const tmpdir = await tmp.dir({ unsafeCleanup: true });
//     try {
//         if (tweet?.extended_entities?.media?.length > 0) {
//             try {
//                 const mediaDir = p.join(tmpdir.path, "media")
//                 if (!await checkPath(mediaDir)) {
//                     await mkdir(mediaDir)
//                 }
//                 for (let i = 0; i < tweet.extended_entities.media.length; i++) {
//                     const mobj = tweet.extended_entities.media[i]
//                     const url = mobj.media_url
//                     if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.video_info?.variants) {
//                         const variants = mobj?.video_info?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
//                         await processMediaURL(variants[0].url, mediaDir, i)
//                     } else {
//                         await processMediaURL(url, mediaDir, i)
//                     }
//                 }
//             } catch (e: any) {
//                 console.error(`while archiving media: ${e.stack}`)
//             }
//         }
//         if (tweet.entities.urls?.length > 0) {
//             try {
//                 for (let i = 0; i < tweet.entities.urls.length; i++) {
//                     const u = tweet.entities.urls[i]
//                     const url = u.expanded_url
//                     // tweets sometimes reference themselves
//                     if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
//                         continue;
//                     }
//                     const headres = await axios.head(url).catch((e) => {
//                         console.log(`heading ${url} - ${e.message}`)
//                     })
//                     if (!headres) { continue }
//                     const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html"
//                     const linkPath = p.join(tmpdir.path, `/links/${i}`)
//                     if (!await checkPath(linkPath)) {
//                         await mkdir(linkPath, { recursive: true })
//                     }
//                     // if it links a web page:
//                     if (contentType === "text/html") {
//                         // add to article DB.
//                         // await article.addUrl(url)
//                     } else {
//                         await processMediaURL(url, linkPath, i)
//                     }
//                 }
//             } catch (e: any) {
//                 console.error(`While processing URLs: ${e.stack ?? e.message}`)
//             }
//         }
//         const subTags = [
//             { name: "Application", value: "TwittAR" },
//             { name: "Tweet-ID", value: `${tweet.id_str ?? "unknown"}` },
//             { name: "Content-Type", value: "application/json" }
//         ]
//         const additionalPaths: { [key: string]: any } = {"": ""};
//         for await (const f of walk(tmpdir.path)) {
//             const relPath = p.relative(tmpdir.path, f)
//             try {
//                 const mimeType = mime.contentType(mime.lookup(relPath) || "application/octet-stream") as string;
//                 const tx = bundlr.createTransaction(
//                     await promises.readFile(p.resolve(f)), 
//                     { tags: [...subTags, { name: "Content-Type", value: mimeType }] }
//                 )
//                 await tx.sign();
//                 const id = tx.id;
//                 const cost = await bundlr.getPrice(tx.size);
//                 console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
//                 console.log("Bundlr subpath upload id for tweet: " + id);
//                 try {
//                     await bundlr.fund(cost.multipliedBy(1.1).integerValue());
//                 } catch (e: any){
//                     console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
//                     process.exit(1);
//                 }
//                 await tx.upload();
//                 if (!id) { throw new Error("Upload Error") }
//                 additionalPaths[relPath] = { id: id };
//             } catch (e: any) {
//                 console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`)
//                 continue
//             }
//         }
//         try{
//             await createAsset(
//                 bundlr,
//                 arweave,
//                 smartweave,
//                 contract,
//                 tweet,
//                 additionalPaths,
//                 config,
//                 "application/json",
//                 ""
//             );
//         } catch (e: any){
//             console.log(`Error creating asset stopping processing...\n ${e}`);
//             process.exit(1);
//         }
//     } catch (e: any) {
//         console.log(`general error: ${e.stack ?? e.message}`)
//         if (tmpdir) {
//             await tmpdir.cleanup()
//         }
//     }
// }
