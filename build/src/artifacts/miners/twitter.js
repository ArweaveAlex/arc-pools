"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const cli_color_1 = __importDefault(require("cli-color"));
const path = __importStar(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const promises_1 = require("fs/promises");
const gql = __importStar(require("gql-query-builder"));
const client_1 = __importDefault(require("@bundlr-network/client"));
const warp_contracts_1 = require("warp-contracts");
const twitter_api_v2_1 = require("twitter-api-v2");
const Twitter = require("node-tweet-stream");
const assets_1 = require("../assets");
const _1 = require(".");
const gql_1 = require("../../gql");
const utils_1 = require("../../utils");
const config_1 = require("../../config");
const arClient = new gql_1.ArweaveClient();
let lockProcess = false;
let poolConfig;
let bundlr;
let keys;
let contract;
let twitter;
let twitterV2;
let tweets = [];
async function run(config, argv) {
    poolConfig = config;
    try {
        keys = JSON.parse(fs_1.default.readFileSync(poolConfig.walletPath).toString());
    }
    catch {
        (0, utils_1.exitProcess)(`Invalid Pool Wallet Configuration`, 1);
    }
    twitter = new Twitter({
        consumer_key: keys.tkeys.consumer_key,
        consumer_secret: keys.tkeys.consumer_secret,
        token: keys.tkeys.token,
        token_secret: keys.tkeys.token_secret,
        tweet_mode: "extended"
    });
    bundlr = new client_1.default(poolConfig.bundlrNode, "arweave", keys.arweave);
    contract = arClient.smartweave.contract(poolConfig.contracts.pool.id);
    warp_contracts_1.LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
    warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
    warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");
    twitterV2 = new twitter_api_v2_1.TwitterApi({
        appKey: keys.tkeys.consumer_key,
        appSecret: keys.tkeys.consumer_secret,
        accessToken: keys.tkeys.token,
        accessSecret: keys.tkeys.token_secret,
    });
    const method = argv["method"];
    const mentionTag = argv["mention-tag"];
    const username = argv["username"];
    switch (method) {
        case undefined:
        case config_1.CLI_ARGS.sources.twitter.methods.stream:
            if (!method) {
                console.log(`Defaulting to stream method ...`);
            }
            mineTweetsByStream();
            return;
        case config_1.CLI_ARGS.sources.twitter.methods.mention:
            if (!mentionTag) {
                (0, utils_1.exitProcess)(`Mention tag not provided`, 1);
            }
            mineTweetsByMention(mentionTag);
            return;
        case config_1.CLI_ARGS.sources.twitter.methods.user:
            if (!username) {
                (0, utils_1.exitProcess)(`Username not provided`, 1);
            }
            mineTweetsByUser(username);
            return;
        default:
            (0, utils_1.exitProcess)(`Invalid method provided`, 1);
    }
}
exports.run = run;
/*
 * Start a twitter stream, aggregate them into a list
 * then mine them onto Arweave synchronously so if it
 * fails in the middle we don't end up with partial
 * atomic assets
 */
async function mineTweetsByStream() {
    console.log(`Mining Tweets by stream ...`);
    twitter.on('tweet', listTweet);
    twitter.on('error', (e) => {
        console.error(`tStream error: ${e}`);
    });
    const trackKeyWords = poolConfig.keywords;
    const trackUsers = poolConfig.twitter.userIds;
    console.log(`Tracking key words: ${trackKeyWords}`);
    console.log(`Tracking users: ${trackUsers}`);
    twitter.track(trackKeyWords);
    twitter.follow(trackUsers);
    setTimeout(() => { lockProcess = true; processTweets(); }, 20000);
}
/*
 * If someone says @thealexarchive #crypto etc...
 * this will grab those and mine them to the pool
 * @param mentionTag: string
 */
async function mineTweetsByMention(mentionTag) {
    console.log(`Mining Tweets by mention ...`);
    console.log(`Mention Tag - [`, cli_color_1.default.green(`'${mentionTag}'`), `]`);
    try {
        // grab all the mentions from twitter
        let query = mentionTag;
        let r;
        let allTweets = [];
        do {
            let params = {
                max_results: 100,
                query: query,
                "tweet.fields": ['referenced_tweets']
            };
            if (r)
                params.next_token = r.meta.next_token;
            r = await twitterV2.v2.search(query, params);
            if (r.data.data)
                allTweets = allTweets.concat(r.data.data);
        } while (r.meta.next_token);
        // get the parent tweets from the mentions above
        // and remove duplicate ids
        let ids = allTweets.map((t) => {
            if (t.referenced_tweets && t.referenced_tweets.length > 0) {
                return t.referenced_tweets[0].id;
            }
        }).filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });
        console.log(ids);
        await processIds(ids);
    }
    catch (e) {
        console.log(e.data);
    }
}
/*
 * mine all of a specific users tweets
 * ignoring duplicates
 * @param username: string
 */
async function mineTweetsByUser(username) {
    console.log(`Mining Tweets by user ...`);
    console.log(`User - [`, cli_color_1.default.green(`'${username}'`), `]`);
    let user;
    try {
        user = await twitterV2.v2.userByUsername(username);
        console.log(`User ID - [`, cli_color_1.default.green(`'${user.data.id}'`), `]`);
    }
    catch {
        (0, utils_1.exitProcess)(`User not found`, 1);
    }
    if (user) {
        let uid = user.data.id;
        let r;
        let allTweets = [];
        do {
            let params = {
                max_results: 100
            };
            if (r)
                params.pagination_token = r.meta.next_token;
            r = await twitterV2.v2.userTimeline(uid, params);
            if (r.data.data)
                allTweets = allTweets.concat(r.data.data);
        } while (r.meta.next_token);
        console.log(`${allTweets.length} tweets fetched`);
        let ids = allTweets.map((t) => {
            return t.id;
        });
        console.log(ids);
        await processIds(ids);
    }
}
async function processIds(ids) {
    // aggregate 10 parent tweets at once
    let allTweets = [];
    for (var j = 0; j < ids.length; j += 10) {
        console.log("Fetching tweet ids: " + ids.slice(j, j + 10));
        let rParents = await twitterV2.v1.tweets(ids.slice(j, j + 5));
        if (rParents.length > 0) {
            allTweets = allTweets.concat(rParents);
        }
        ;
    }
    for (let j = 0; j < allTweets.length; j++) {
        let dup = await isDuplicate(allTweets[j]);
        if (!dup) {
            let t = allTweets[j];
            if (!t.text)
                t.text = t.full_text;
            await processTweet(t);
        }
        else {
            console.log("Tweet already mined skipping: " + (0, assets_1.generateTweetName)(allTweets[j]));
        }
    }
}
async function isDuplicate(tweet) {
    let tName = (0, assets_1.generateTweetName)(tweet);
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
    const response = await arClient.arweave.api.post("/graphql", query());
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
async function listTweet(tweet) {
    if (!tweet.retweeted_status && !lockProcess) {
        console.log("Pushing new tweet: " + tweet);
        tweets.push(tweet);
    }
    if (lockProcess) {
        twitter.on('tweet', () => { });
    }
    return;
}
async function processTweets() {
    console.log(tweets.length);
    for (let i = 0; i < tweets.length; i++) {
        await processTweet(tweets[i]);
    }
    console.log("Finished processing all tweets...");
    process.exit(1);
}
async function processTweet(tweet) {
    const tmpdir = await tmp_promise_1.default.dir({ unsafeCleanup: true });
    try {
        if (tweet?.extended_entities?.media?.length > 0) {
            try {
                const mediaDir = path.join(tmpdir.path, "media");
                if (!await (0, _1.checkPath)(mediaDir)) {
                    await (0, promises_1.mkdir)(mediaDir);
                }
                for (let i = 0; i < tweet.extended_entities.media.length; i++) {
                    const mobj = tweet.extended_entities.media[i];
                    const url = mobj.media_url;
                    if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.video_info?.variants) {
                        const variants = mobj?.video_info?.variants.sort((a, b) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1));
                        await (0, _1.processMediaURL)(variants[0].url, mediaDir, i);
                    }
                    else {
                        await (0, _1.processMediaURL)(url, mediaDir, i);
                    }
                }
            }
            catch (e) {
                console.error(`while archiving media: ${e.stack}`);
            }
        }
        if (tweet.entities.urls?.length > 0) {
            try {
                for (let i = 0; i < tweet.entities.urls.length; i++) {
                    const u = tweet.entities.urls[i];
                    const url = u.expanded_url;
                    // tweets sometimes reference themselves
                    if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
                        continue;
                    }
                    const headres = await axios_1.default.head(url).catch((e) => {
                        console.log(`heading ${url} - ${e.message}`);
                    });
                    if (!headres) {
                        continue;
                    }
                    const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html";
                    const linkPath = path.join(tmpdir.path, `/links/${i}`);
                    if (!await (0, _1.checkPath)(linkPath)) {
                        await (0, promises_1.mkdir)(linkPath, { recursive: true });
                    }
                    // if it links a web page:
                    if (contentType === "text/html") {
                        // add to article DB.
                        // await article.addUrl(url)
                    }
                    else {
                        await (0, _1.processMediaURL)(url, linkPath, i);
                    }
                }
            }
            catch (e) {
                console.error(`While processing URLs: ${e.stack ?? e.message}`);
            }
        }
        const subTags = [
            { name: "Application", value: "TwittAR" },
            { name: "Tweet-ID", value: `${tweet.id_str ?? "unknown"}` },
            { name: "Content-Type", value: "application/json" }
        ];
        const additionalPaths = { "": "" };
        for await (const f of (0, _1.walk)(tmpdir.path)) {
            const relPath = path.relative(tmpdir.path, f);
            try {
                const mimeType = mime_types_1.default.contentType(mime_types_1.default.lookup(relPath) || "application/octet-stream");
                const tx = bundlr.createTransaction(await fs_1.default.promises.readFile(path.resolve(f)), { tags: [...subTags, { name: "Content-Type", value: mimeType }] });
                await tx.sign();
                const id = tx.id;
                const cost = await bundlr.getPrice(tx.size);
                console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                console.log("Bundlr subpath upload id for tweet: " + id);
                try {
                    await bundlr.fund(cost.multipliedBy(1.1).integerValue());
                }
                catch (e) {
                    console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
                    process.exit(1);
                }
                await tx.upload();
                if (!id) {
                    throw new Error("Upload Error");
                }
                additionalPaths[relPath] = { id: id };
            }
            catch (e) {
                console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`);
                continue;
            }
        }
        try {
            await (0, assets_1.createAsset)(bundlr, arClient.arweave, arClient.smartweave, contract, tweet, additionalPaths, poolConfig, "application/json", "");
        }
        catch (e) {
            console.log(`Error creating asset stopping processing...\n ${e}`);
            process.exit(1);
        }
    }
    catch (e) {
        console.log(`general error: ${e.stack ?? e.message}`);
        if (tmpdir) {
            await tmpdir.cleanup();
        }
    }
}
