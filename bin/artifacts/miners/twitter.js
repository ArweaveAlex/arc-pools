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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.run = void 0;
var fs_1 = __importDefault(require("fs"));
var axios_1 = __importDefault(require("axios"));
var cli_color_1 = __importDefault(require("cli-color"));
var path = __importStar(require("path"));
var mime_types_1 = __importDefault(require("mime-types"));
var tmp_promise_1 = __importDefault(require("tmp-promise"));
var promises_1 = require("fs/promises");
var gql = __importStar(require("gql-query-builder"));
var client_1 = __importDefault(require("@bundlr-network/client"));
var warp_contracts_1 = require("warp-contracts");
var twitter_api_v2_1 = require("twitter-api-v2");
var Twitter = require("node-tweet-stream");
var assets_1 = require("../assets");
var _1 = require(".");
var gql_1 = require("../../gql");
var utils_1 = require("../../utils");
var config_1 = require("../../config");
var arClient = new gql_1.ArweaveClient();
var lockProcess = false;
var poolConfig;
var bundlr;
var keys;
var contract;
var twitter;
var twitterV2;
var tweets = [];
function run(config, argv) {
    return __awaiter(this, void 0, void 0, function () {
        var method, mentionTag, username;
        return __generator(this, function (_a) {
            poolConfig = config;
            try {
                keys = JSON.parse(fs_1["default"].readFileSync(poolConfig.walletPath).toString());
            }
            catch (_b) {
                (0, utils_1.exitProcess)("Invalid Pool Wallet Configuration", 1);
            }
            twitter = new Twitter({
                consumer_key: keys.tkeys.consumer_key,
                consumer_secret: keys.tkeys.consumer_secret,
                token: keys.tkeys.token,
                token_secret: keys.tkeys.token_secret,
                tweet_mode: "extended"
            });
            bundlr = new client_1["default"](poolConfig.bundlrNode, "arweave", keys.arweave);
            contract = arClient.smartweave.contract(poolConfig.contracts.pool.id);
            warp_contracts_1.LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
            warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
            warp_contracts_1.LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");
            twitterV2 = new twitter_api_v2_1.TwitterApi({
                appKey: keys.tkeys.consumer_key,
                appSecret: keys.tkeys.consumer_secret,
                accessToken: keys.tkeys.token,
                accessSecret: keys.tkeys.token_secret
            });
            method = argv["method"];
            mentionTag = argv["mention-tag"];
            username = argv["username"];
            switch (method) {
                case undefined:
                case config_1.CLI_ARGS.sources.twitter.methods.stream:
                    if (!method) {
                        console.log("Defaulting to stream method ...");
                    }
                    mineTweetsByStream();
                    return [2 /*return*/];
                case config_1.CLI_ARGS.sources.twitter.methods.mention:
                    if (!mentionTag) {
                        (0, utils_1.exitProcess)("Mention tag not provided", 1);
                    }
                    mineTweetsByMention(mentionTag);
                    return [2 /*return*/];
                case config_1.CLI_ARGS.sources.twitter.methods.user:
                    if (!username) {
                        (0, utils_1.exitProcess)("Username not provided", 1);
                    }
                    mineTweetsByUser(username);
                    return [2 /*return*/];
                default:
                    (0, utils_1.exitProcess)("Invalid method provided", 1);
            }
            return [2 /*return*/];
        });
    });
}
exports.run = run;
/*
 * Start a twitter stream, aggregate them into a list
 * then mine them onto Arweave synchronously so if it
 * fails in the middle we don't end up with partial
 * atomic assets
 */
function mineTweetsByStream() {
    return __awaiter(this, void 0, void 0, function () {
        var trackKeyWords, trackUsers;
        return __generator(this, function (_a) {
            console.log("Mining Tweets by stream ...");
            twitter.on('tweet', listTweet);
            twitter.on('error', function (e) {
                console.error("tStream error: ".concat(e));
            });
            trackKeyWords = poolConfig.keywords;
            trackUsers = poolConfig.twitter.userIds;
            console.log("Tracking key words: ".concat(trackKeyWords));
            console.log("Tracking users: ".concat(trackUsers));
            twitter.track(trackKeyWords);
            twitter.follow(trackUsers);
            setTimeout(function () { lockProcess = true; processTweets(); }, 20000);
            return [2 /*return*/];
        });
    });
}
/*
 * If someone says @thealexarchive #crypto etc...
 * this will grab those and mine them to the pool
 * @param mentionTag: string
 */
function mineTweetsByMention(mentionTag) {
    return __awaiter(this, void 0, void 0, function () {
        var query, r, allTweets, params, ids, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Mining Tweets by mention ...");
                    console.log("Mention Tag - [", cli_color_1["default"].green("'".concat(mentionTag, "'")), "]");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    query = mentionTag;
                    r = void 0;
                    allTweets = [];
                    _a.label = 2;
                case 2:
                    params = {
                        max_results: 100,
                        query: query,
                        "tweet.fields": ['referenced_tweets']
                    };
                    if (r)
                        params.next_token = r.meta.next_token;
                    return [4 /*yield*/, twitterV2.v2.search(query, params)];
                case 3:
                    r = _a.sent();
                    if (r.data.data)
                        allTweets = allTweets.concat(r.data.data);
                    _a.label = 4;
                case 4:
                    if (r.meta.next_token) return [3 /*break*/, 2];
                    _a.label = 5;
                case 5:
                    ids = allTweets.map(function (t) {
                        if (t.referenced_tweets && t.referenced_tweets.length > 0) {
                            return t.referenced_tweets[0].id;
                        }
                    }).filter(function (item, pos, self) {
                        return self.indexOf(item) == pos;
                    });
                    console.log(ids);
                    return [4 /*yield*/, processIds(ids)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    console.log(e_1.data);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/*
 * mine all of a specific users tweets
 * ignoring duplicates
 * @param username: string
 */
function mineTweetsByUser(username) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, uid, r, allTweets, params, ids;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Mining Tweets by user ...");
                    console.log("User - [", cli_color_1["default"].green("'".concat(username, "'")), "]");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, twitterV2.v2.userByUsername(username)];
                case 2:
                    user = _b.sent();
                    console.log("User ID - [", cli_color_1["default"].green("'".concat(user.data.id, "'")), "]");
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    (0, utils_1.exitProcess)("User not found", 1);
                    return [3 /*break*/, 4];
                case 4:
                    if (!user) return [3 /*break*/, 10];
                    uid = user.data.id;
                    r = void 0;
                    allTweets = [];
                    _b.label = 5;
                case 5:
                    params = {
                        max_results: 100
                    };
                    if (r)
                        params.pagination_token = r.meta.next_token;
                    return [4 /*yield*/, twitterV2.v2.userTimeline(uid, params)];
                case 6:
                    r = _b.sent();
                    if (r.data.data)
                        allTweets = allTweets.concat(r.data.data);
                    _b.label = 7;
                case 7:
                    if (r.meta.next_token) return [3 /*break*/, 5];
                    _b.label = 8;
                case 8:
                    console.log("".concat(allTweets.length, " tweets fetched"));
                    ids = allTweets.map(function (t) {
                        return t.id;
                    });
                    console.log(ids);
                    return [4 /*yield*/, processIds(ids)];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function processIds(ids) {
    return __awaiter(this, void 0, void 0, function () {
        var allTweets, j, rParents, j_1, dup, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allTweets = [];
                    j = 0;
                    _a.label = 1;
                case 1:
                    if (!(j < ids.length)) return [3 /*break*/, 4];
                    console.log("Fetching tweet ids: " + ids.slice(j, j + 10));
                    return [4 /*yield*/, twitterV2.v1.tweets(ids.slice(j, j + 5))];
                case 2:
                    rParents = _a.sent();
                    if (rParents.length > 0) {
                        allTweets = allTweets.concat(rParents);
                    }
                    ;
                    _a.label = 3;
                case 3:
                    j += 10;
                    return [3 /*break*/, 1];
                case 4:
                    j_1 = 0;
                    _a.label = 5;
                case 5:
                    if (!(j_1 < allTweets.length)) return [3 /*break*/, 10];
                    return [4 /*yield*/, isDuplicate(allTweets[j_1])];
                case 6:
                    dup = _a.sent();
                    if (!!dup) return [3 /*break*/, 8];
                    t = allTweets[j_1];
                    if (!t.text)
                        t.text = t.full_text;
                    return [4 /*yield*/, processTweet(t)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    console.log("Tweet already mined skipping: " + (0, assets_1.generateTweetName)(allTweets[j_1]));
                    _a.label = 9;
                case 9:
                    j_1++;
                    return [3 /*break*/, 5];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function isDuplicate(tweet) {
    return __awaiter(this, void 0, void 0, function () {
        var tName, query, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tName = (0, assets_1.generateTweetName)(tweet);
                    query = function () { return gql.query({
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
                    }); };
                    return [4 /*yield*/, arClient.arweave.api.post("/graphql", query())];
                case 1:
                    response = _a.sent();
                    if (response.data && response.data.data) {
                        if (response.data.data.transactions) {
                            if (response.data.data.transactions.edges) {
                                if (response.data.data.transactions.edges.length > 0) {
                                    return [2 /*return*/, true];
                                }
                            }
                        }
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
function listTweet(tweet) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!tweet.retweeted_status && !lockProcess) {
                console.log("Pushing new tweet: " + tweet);
                tweets.push(tweet);
            }
            if (lockProcess) {
                twitter.on('tweet', function () { });
            }
            return [2 /*return*/];
        });
    });
}
function processTweets() {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(tweets.length);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < tweets.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, processTweet(tweets[i])];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("Finished processing all tweets...");
                    process.exit(1);
                    return [2 /*return*/];
            }
        });
    });
}
function processTweet(tweet) {
    var _a, e_2, _b, _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function () {
        var tmpdir, mediaDir, i, mobj, url, variants, e_3, _loop_1, i, e_4, subTags, additionalPaths, _q, _r, _s, f, relPath, mimeType, tx, _t, _u, id, cost, e_5, e_6, e_2_1, e_7, e_8;
        return __generator(this, function (_v) {
            switch (_v.label) {
                case 0: return [4 /*yield*/, tmp_promise_1["default"].dir({ unsafeCleanup: true })];
                case 1:
                    tmpdir = _v.sent();
                    _v.label = 2;
                case 2:
                    _v.trys.push([2, 50, , 53]);
                    if (!(((_e = (_d = tweet === null || tweet === void 0 ? void 0 : tweet.extended_entities) === null || _d === void 0 ? void 0 : _d.media) === null || _e === void 0 ? void 0 : _e.length) > 0)) return [3 /*break*/, 14];
                    _v.label = 3;
                case 3:
                    _v.trys.push([3, 13, , 14]);
                    mediaDir = path.join(tmpdir.path, "media");
                    return [4 /*yield*/, (0, _1.checkPath)(mediaDir)];
                case 4:
                    if (!!(_v.sent())) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, promises_1.mkdir)(mediaDir)];
                case 5:
                    _v.sent();
                    _v.label = 6;
                case 6:
                    i = 0;
                    _v.label = 7;
                case 7:
                    if (!(i < tweet.extended_entities.media.length)) return [3 /*break*/, 12];
                    mobj = tweet.extended_entities.media[i];
                    url = mobj.media_url;
                    if (!((mobj.type === "video" || mobj.type === "animated_gif") && ((_f = mobj === null || mobj === void 0 ? void 0 : mobj.video_info) === null || _f === void 0 ? void 0 : _f.variants))) return [3 /*break*/, 9];
                    variants = (_g = mobj === null || mobj === void 0 ? void 0 : mobj.video_info) === null || _g === void 0 ? void 0 : _g.variants.sort(function (a, b) { var _a, _b; return (((_a = a.bitrate) !== null && _a !== void 0 ? _a : 1000) > ((_b = b.bitrate) !== null && _b !== void 0 ? _b : 1000) ? -1 : 1); });
                    return [4 /*yield*/, (0, _1.processMediaURL)(variants[0].url, mediaDir, i)];
                case 8:
                    _v.sent();
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, (0, _1.processMediaURL)(url, mediaDir, i)];
                case 10:
                    _v.sent();
                    _v.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 7];
                case 12: return [3 /*break*/, 14];
                case 13:
                    e_3 = _v.sent();
                    console.error("while archiving media: ".concat(e_3.stack));
                    return [3 /*break*/, 14];
                case 14:
                    if (!(((_h = tweet.entities.urls) === null || _h === void 0 ? void 0 : _h.length) > 0)) return [3 /*break*/, 21];
                    _v.label = 15;
                case 15:
                    _v.trys.push([15, 20, , 21]);
                    _loop_1 = function (i) {
                        var u, url, headres, contentType, linkPath;
                        return __generator(this, function (_w) {
                            switch (_w.label) {
                                case 0:
                                    u = tweet.entities.urls[i];
                                    url = u.expanded_url;
                                    // tweets sometimes reference themselves
                                    if (url === "https://twitter.com/i/web/status/".concat(tweet.id_str)) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, axios_1["default"].head(url)["catch"](function (e) {
                                            console.log("heading ".concat(url, " - ").concat(e.message));
                                        })];
                                case 1:
                                    headres = _w.sent();
                                    if (!headres) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    contentType = (_l = (_k = (_j = headres.headers["content-type"]) === null || _j === void 0 ? void 0 : _j.split(";")[0]) === null || _k === void 0 ? void 0 : _k.toLowerCase()) !== null && _l !== void 0 ? _l : "text/html";
                                    linkPath = path.join(tmpdir.path, "/links/".concat(i));
                                    return [4 /*yield*/, (0, _1.checkPath)(linkPath)];
                                case 2:
                                    if (!!(_w.sent())) return [3 /*break*/, 4];
                                    return [4 /*yield*/, (0, promises_1.mkdir)(linkPath, { recursive: true })];
                                case 3:
                                    _w.sent();
                                    _w.label = 4;
                                case 4:
                                    if (!(contentType === "text/html")) return [3 /*break*/, 5];
                                    return [3 /*break*/, 7];
                                case 5: return [4 /*yield*/, (0, _1.processMediaURL)(url, linkPath, i)];
                                case 6:
                                    _w.sent();
                                    _w.label = 7;
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _v.label = 16;
                case 16:
                    if (!(i < tweet.entities.urls.length)) return [3 /*break*/, 19];
                    return [5 /*yield**/, _loop_1(i)];
                case 17:
                    _v.sent();
                    _v.label = 18;
                case 18:
                    i++;
                    return [3 /*break*/, 16];
                case 19: return [3 /*break*/, 21];
                case 20:
                    e_4 = _v.sent();
                    console.error("While processing URLs: ".concat((_m = e_4.stack) !== null && _m !== void 0 ? _m : e_4.message));
                    return [3 /*break*/, 21];
                case 21:
                    subTags = [
                        { name: "Application", value: "TwittAR" },
                        { name: "Tweet-ID", value: "".concat((_o = tweet.id_str) !== null && _o !== void 0 ? _o : "unknown") },
                        { name: "Content-Type", value: "application/json" }
                    ];
                    additionalPaths = { "": "" };
                    _v.label = 22;
                case 22:
                    _v.trys.push([22, 40, 41, 46]);
                    _q = true, _r = __asyncValues((0, _1.walk)(tmpdir.path));
                    _v.label = 23;
                case 23: return [4 /*yield*/, _r.next()];
                case 24:
                    if (!(_s = _v.sent(), _a = _s.done, !_a)) return [3 /*break*/, 39];
                    _c = _s.value;
                    _q = false;
                    _v.label = 25;
                case 25:
                    _v.trys.push([25, , 37, 38]);
                    f = _c;
                    relPath = path.relative(tmpdir.path, f);
                    _v.label = 26;
                case 26:
                    _v.trys.push([26, 35, , 36]);
                    mimeType = mime_types_1["default"].contentType(mime_types_1["default"].lookup(relPath) || "application/octet-stream");
                    _u = (_t = bundlr).createTransaction;
                    return [4 /*yield*/, fs_1["default"].promises.readFile(path.resolve(f))];
                case 27:
                    tx = _u.apply(_t, [_v.sent(), { tags: __spreadArray(__spreadArray([], subTags, true), [{ name: "Content-Type", value: mimeType }], false) }]);
                    return [4 /*yield*/, tx.sign()];
                case 28:
                    _v.sent();
                    id = tx.id;
                    return [4 /*yield*/, bundlr.getPrice(tx.size)];
                case 29:
                    cost = _v.sent();
                    console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                    console.log("Bundlr subpath upload id for tweet: " + id);
                    _v.label = 30;
                case 30:
                    _v.trys.push([30, 32, , 33]);
                    return [4 /*yield*/, bundlr.fund(cost.multipliedBy(1.1).integerValue())];
                case 31:
                    _v.sent();
                    return [3 /*break*/, 33];
                case 32:
                    e_5 = _v.sent();
                    console.log("Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ".concat(e_5));
                    process.exit(1);
                    return [3 /*break*/, 33];
                case 33: return [4 /*yield*/, tx.upload()];
                case 34:
                    _v.sent();
                    if (!id) {
                        throw new Error("Upload Error");
                    }
                    additionalPaths[relPath] = { id: id };
                    return [3 /*break*/, 36];
                case 35:
                    e_6 = _v.sent();
                    console.log("Error uploading ".concat(f, " for ").concat(tweet.id_str, " - ").concat(e_6));
                    return [3 /*break*/, 38];
                case 36: return [3 /*break*/, 38];
                case 37:
                    _q = true;
                    return [7 /*endfinally*/];
                case 38: return [3 /*break*/, 23];
                case 39: return [3 /*break*/, 46];
                case 40:
                    e_2_1 = _v.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 46];
                case 41:
                    _v.trys.push([41, , 44, 45]);
                    if (!(!_q && !_a && (_b = _r["return"]))) return [3 /*break*/, 43];
                    return [4 /*yield*/, _b.call(_r)];
                case 42:
                    _v.sent();
                    _v.label = 43;
                case 43: return [3 /*break*/, 45];
                case 44:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 45: return [7 /*endfinally*/];
                case 46:
                    _v.trys.push([46, 48, , 49]);
                    return [4 /*yield*/, (0, assets_1.createAsset)(bundlr, arClient.arweave, arClient.smartweave, contract, tweet, additionalPaths, poolConfig, "application/json", "")];
                case 47:
                    _v.sent();
                    return [3 /*break*/, 49];
                case 48:
                    e_7 = _v.sent();
                    console.log("Error creating asset stopping processing...\n ".concat(e_7));
                    process.exit(1);
                    return [3 /*break*/, 49];
                case 49: return [3 /*break*/, 53];
                case 50:
                    e_8 = _v.sent();
                    console.log("general error: ".concat((_p = e_8.stack) !== null && _p !== void 0 ? _p : e_8.message));
                    if (!tmpdir) return [3 /*break*/, 52];
                    return [4 /*yield*/, tmpdir.cleanup()];
                case 51:
                    _v.sent();
                    _v.label = 52;
                case 52: return [3 /*break*/, 53];
                case 53: return [2 /*return*/];
            }
        });
    });
}
