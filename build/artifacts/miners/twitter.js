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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mineTweetsByUser = exports.mineTweetsByMention = exports.mineTweets = void 0;
const client_1 = __importDefault(require("@bundlr-network/client"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const p = __importStar(require("path"));
const promises_1 = require("fs/promises");
const axios_1 = __importDefault(require("axios"));
const arweave_1 = __importDefault(require("arweave"));
const mime_types_1 = __importDefault(require("mime-types"));
const warp_contracts_1 = require("warp-contracts");
const fs_1 = require("fs");
const twitter_api_v2_1 = require("twitter-api-v2");
const gql = __importStar(require("gql-query-builder"));
const Twitter = require('node-tweet-stream');
const assets_1 = require("../assets");
const config_1 = require("../../config");
const _1 = require(".");
let lockProcess = false;
let twitter;
let bundlr;
let config;
let keys;
let arweave;
let smartweave;
let contract;
let tweets = [];
let twitterClientV2;
function init(poolSlug) {
    return __awaiter(this, void 0, void 0, function* () {
        config = JSON.parse((0, fs_1.readFileSync)(config_1.POOLS_PATH).toString())[poolSlug];
        if (!config)
            throw new Error("Invalid pool slug");
        keys = JSON.parse((0, fs_1.readFileSync)(config.walletPath).toString());
        twitter = new Twitter({
            consumer_key: keys.tkeys.consumer_key,
            consumer_secret: keys.tkeys.consumer_secret,
            token: keys.tkeys.token,
            token_secret: keys.tkeys.token_secret,
            tweet_mode: "extended"
        });
        bundlr = new client_1.default(config.bundlrNode, "arweave", keys.arweave);
        console.log("Bundlr balance", (yield bundlr.getLoadedBalance()).toString());
        console.log(`Loaded with account address: ${bundlr.address}`);
        arweave = arweave_1.default.init({
            host: "arweave.net",
            port: 443,
            protocol: "https"
        });
        smartweave = warp_contracts_1.WarpNodeFactory.memCachedBased(arweave).useArweaveGateway().build();
        contract = smartweave.contract(config.pool.contract).setEvaluationOptions({
            walletBalanceUrl: config.balanceUrl
        });
        warp_contracts_1.LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
        warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
        warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");
        twitterClientV2 = new twitter_api_v2_1.TwitterApi({
            appKey: keys.tkeys.consumer_key,
            appSecret: keys.tkeys.consumer_secret,
            accessToken: keys.tkeys.token,
            accessSecret: keys.tkeys.token_secret,
        });
    });
}
/**
 * Start a twitter stream, aggregate them into a list
 * then mine them onto Arweave synchronously so if it
 * fails in the middle we don't end up with partial
 * atomic assets
 * @param poolSlug
 */
function mineTweets(poolSlug) {
    return __awaiter(this, void 0, void 0, function* () {
        yield init(poolSlug);
        twitter.on('tweet', listTweet);
        twitter.on('error', (e) => {
            console.error(`tStream error: ${e}`);
        });
        const trackKeyWords = config.keywords;
        const trackUsers = config.userIDs;
        console.log(`Tracking key words: ${trackKeyWords}`);
        console.log(`Tracking users: ${trackUsers}`);
        twitter.track(trackKeyWords);
        twitter.follow(trackUsers);
        setTimeout(() => { lockProcess = true; processTweets(); }, 20000);
    });
}
exports.mineTweets = mineTweets;
/**
 * If someone sais @thealexarchive #crypto etc...
 * this will grab those and mine them to the pool
 * @param poolSlug
 */
function mineTweetsByMention(poolSlug, mentionTag) {
    return __awaiter(this, void 0, void 0, function* () {
        yield init(poolSlug);
        console.log("Running mining process for mentions...");
        console.log(mentionTag);
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
                r = yield twitterClientV2.v2.search(query, params);
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
            yield processIds(ids);
        }
        catch (e) {
            console.log(e.data);
        }
    });
}
exports.mineTweetsByMention = mineTweetsByMention;
/**
 * mine all of a specific users tweets
 * ignoring duplicates
 * @param poolSlug
 */
function mineTweetsByUser(poolSlug, userName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield init(poolSlug);
        let user = yield twitterClientV2.v2.userByUsername(userName);
        console.log("Running mining process for user...");
        console.log(userName);
        console.log(user.data.id);
        let uid = user.data.id;
        let r;
        let allTweets = [];
        do {
            let params = {
                max_results: 100
            };
            if (r)
                params.pagination_token = r.meta.next_token;
            r = yield twitterClientV2.v2.userTimeline(uid, params);
            if (r.data.data)
                allTweets = allTweets.concat(r.data.data);
        } while (r.meta.next_token);
        console.log(allTweets.length + " tweets fetched");
        let ids = allTweets.map((t) => {
            return t.id;
        });
        console.log(ids);
        yield processIds(ids);
    });
}
exports.mineTweetsByUser = mineTweetsByUser;
function processIds(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        // aggregate 10 parent tweets at once
        let allTweets = [];
        for (var j = 0; j < ids.length; j += 10) {
            console.log("Fetching tweet ids: " + ids.slice(j, j + 10));
            let rParents = yield twitterClientV2.v1.tweets(ids.slice(j, j + 5));
            if (rParents.length > 0) {
                allTweets = allTweets.concat(rParents);
            }
            ;
        }
        for (let j = 0; j < allTweets.length; j++) {
            let dup = yield isDuplicate(allTweets[j]);
            if (!dup) {
                let t = allTweets[j];
                if (!t.text)
                    t.text = t.full_text;
                yield processTweet(t);
            }
            else {
                console.log("Tweet already mined skipping: " + (0, assets_1.generateTweetName)(allTweets[j]));
            }
        }
    });
}
function isDuplicate(tweet) {
    return __awaiter(this, void 0, void 0, function* () {
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
                            values: [config.pool.contract]
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
        const response = yield arweave.api.post("/graphql", query());
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
    });
}
function listTweet(tweet) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tweet.retweeted_status && !lockProcess) {
            console.log("Pushing new tweet: " + tweet);
            tweets.push(tweet);
        }
        if (lockProcess) {
            twitter.on('tweet', () => { });
        }
        return;
    });
}
function processTweets() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(tweets.length);
        for (let i = 0; i < tweets.length; i++) {
            yield processTweet(tweets[i]);
        }
        console.log("Finished processing all tweets...");
        process.exit(1);
    });
}
function processTweet(tweet) {
    var _a, e_1, _b, _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function* () {
        const tmpdir = yield tmp_promise_1.default.dir({ unsafeCleanup: true });
        try {
            if (((_e = (_d = tweet === null || tweet === void 0 ? void 0 : tweet.extended_entities) === null || _d === void 0 ? void 0 : _d.media) === null || _e === void 0 ? void 0 : _e.length) > 0) {
                try {
                    const mediaDir = p.join(tmpdir.path, "media");
                    if (!(yield (0, _1.checkPath)(mediaDir))) {
                        yield (0, promises_1.mkdir)(mediaDir);
                    }
                    for (let i = 0; i < tweet.extended_entities.media.length; i++) {
                        const mobj = tweet.extended_entities.media[i];
                        const url = mobj.media_url;
                        if ((mobj.type === "video" || mobj.type === "animated_gif") && ((_f = mobj === null || mobj === void 0 ? void 0 : mobj.video_info) === null || _f === void 0 ? void 0 : _f.variants)) {
                            const variants = (_g = mobj === null || mobj === void 0 ? void 0 : mobj.video_info) === null || _g === void 0 ? void 0 : _g.variants.sort((a, b) => { var _a, _b; return (((_a = a.bitrate) !== null && _a !== void 0 ? _a : 1000) > ((_b = b.bitrate) !== null && _b !== void 0 ? _b : 1000) ? -1 : 1); });
                            yield (0, _1.processMediaURL)(variants[0].url, mediaDir, i);
                        }
                        else {
                            yield (0, _1.processMediaURL)(url, mediaDir, i);
                        }
                    }
                }
                catch (e) {
                    console.error(`while archiving media: ${e.stack}`);
                }
            }
            if (((_h = tweet.entities.urls) === null || _h === void 0 ? void 0 : _h.length) > 0) {
                try {
                    for (let i = 0; i < tweet.entities.urls.length; i++) {
                        const u = tweet.entities.urls[i];
                        const url = u.expanded_url;
                        // tweets sometimes reference themselves
                        if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
                            continue;
                        }
                        const headres = yield axios_1.default.head(url).catch((e) => {
                            console.log(`heading ${url} - ${e.message}`);
                        });
                        if (!headres) {
                            continue;
                        }
                        const contentType = (_l = (_k = (_j = headres.headers["content-type"]) === null || _j === void 0 ? void 0 : _j.split(";")[0]) === null || _k === void 0 ? void 0 : _k.toLowerCase()) !== null && _l !== void 0 ? _l : "text/html";
                        const linkPath = p.join(tmpdir.path, `/links/${i}`);
                        if (!(yield (0, _1.checkPath)(linkPath))) {
                            yield (0, promises_1.mkdir)(linkPath, { recursive: true });
                        }
                        // if it links a web page:
                        if (contentType === "text/html") {
                            // add to article DB.
                            // await article.addUrl(url)
                        }
                        else {
                            yield (0, _1.processMediaURL)(url, linkPath, i);
                        }
                    }
                }
                catch (e) {
                    console.error(`While processing URLs: ${(_m = e.stack) !== null && _m !== void 0 ? _m : e.message}`);
                }
            }
            const subTags = [
                { name: "Application", value: "TwittAR" },
                { name: "Tweet-ID", value: `${(_o = tweet.id_str) !== null && _o !== void 0 ? _o : "unknown"}` },
                { name: "Content-Type", value: "application/json" }
            ];
            const additionalPaths = { "": "" };
            try {
                for (var _q = true, _r = __asyncValues((0, _1.walk)(tmpdir.path)), _s; _s = yield _r.next(), _a = _s.done, !_a;) {
                    _c = _s.value;
                    _q = false;
                    try {
                        const f = _c;
                        const relPath = p.relative(tmpdir.path, f);
                        try {
                            const mimeType = mime_types_1.default.contentType(mime_types_1.default.lookup(relPath) || "application/octet-stream");
                            const tx = bundlr.createTransaction(yield fs_1.promises.readFile(p.resolve(f)), { tags: [...subTags, { name: "Content-Type", value: mimeType }] });
                            yield tx.sign();
                            const id = tx.id;
                            const cost = yield bundlr.getPrice(tx.size);
                            console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                            console.log("Bundlr subpath upload id for tweet: " + id);
                            try {
                                yield bundlr.fund(cost.multipliedBy(1.1).integerValue());
                            }
                            catch (e) {
                                console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
                                process.exit(1);
                            }
                            yield tx.upload();
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
                    finally {
                        _q = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_q && !_a && (_b = _r.return)) yield _b.call(_r);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                yield (0, assets_1.createAsset)(bundlr, arweave, smartweave, contract, tweet, additionalPaths, config, "application/json", "");
            }
            catch (e) {
                console.log(`Error creating asset stopping processing...\n ${e}`);
                process.exit(1);
            }
        }
        catch (e) {
            console.log(`general error: ${(_p = e.stack) !== null && _p !== void 0 ? _p : e.message}`);
            if (tmpdir) {
                yield tmpdir.cleanup();
            }
        }
    });
}
