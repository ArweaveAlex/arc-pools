"use strict";
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
exports.__esModule = true;
exports.dispatchToBundler = exports.createAsset = exports.generateTweetName = exports.selectTokenHolder = void 0;
var fs_1 = require("fs");
var warp_contracts_1 = require("warp-contracts");
var URL = 'https://gateway.redstone.finance/gateway/contracts/deploy';
var keys;
var bundlr;
var arweave;
var jwk;
// let smartweave: Warp;
var contract;
warp_contracts_1.LoggerFactory.INST.logLevel("fatal");
function getRandomContributor() {
    return __awaiter(this, void 0, void 0, function () {
        var state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, contract.readState()];
                case 1:
                    state = _a.sent();
                    return [2 /*return*/, selectTokenHolder(state.state.tokens, state.state.totalSupply)];
            }
        });
    });
}
function selectTokenHolder(tokens, totalSupply) {
    var weights = {};
    for (var _i = 0, _a = Object.keys(tokens); _i < _a.length; _i++) {
        var address = _a[_i];
        weights[address] = tokens[address] / totalSupply;
    }
    var sum = 0;
    var r = Math.random();
    for (var _b = 0, _c = Object.keys(weights); _b < _c.length; _b++) {
        var address = _c[_b];
        sum += weights[address];
        if (r <= sum && weights[address] > 0) {
            return address;
        }
    }
    throw new Error("Unable to select token holder");
}
exports.selectTokenHolder = selectTokenHolder;
function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + "...";
    }
    else {
        return str;
    }
}
var generateTweetName = function (tweet) {
    if (tweet.text) {
        if (tweet.text.length > 30) {
            return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.text, 30);
        }
        else {
            return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.text;
        }
    }
    else if (tweet.full_text) {
        if (tweet.full_text.length > 30) {
            return 'Username: ' + tweet.user.name + ', Tweet: ' + truncateString(tweet.full_text, 30);
        }
        else {
            return 'Username: ' + tweet.user.name + ', Tweet: ' + tweet.full_text;
        }
    }
    else {
        return 'Username: ' + tweet.user.name + ', Tweet Id: ' + tweet.id;
    }
};
exports.generateTweetName = generateTweetName;
var createAsset = function (bundlrIn, arweaveIn, warpIn, contractIn, content, additionalPaths, poolConfig, contentType, articleTitle) { return __awaiter(void 0, void 0, void 0, function () {
    var data, tx, assetId, uploader, err_1, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(warpIn);
                keys = JSON.parse((0, fs_1.readFileSync)(poolConfig.walletPath).toString());
                jwk = keys.arweave;
                bundlr = bundlrIn;
                arweave = arweaveIn;
                // smartweave = warpIn;
                contract = contractIn;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 12, , 13]);
                data = contentType === 'application/json' ? JSON.stringify(content) : content;
                return [4 /*yield*/, arweave.createTransaction({
                        data: data
                    }, jwk)];
            case 2:
                tx = _a.sent();
                tx.addTag('Content-Type', contentType);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 10, , 11]);
                return [4 /*yield*/, arweave.transactions.sign(tx, jwk)];
            case 4:
                _a.sent();
                assetId = tx.id;
                return [4 /*yield*/, arweave.transactions.getUploader(tx)];
            case 5:
                uploader = _a.sent();
                _a.label = 6;
            case 6:
                if (!!uploader.isComplete) return [3 /*break*/, 8];
                return [4 /*yield*/, uploader.uploadChunk()];
            case 7:
                _a.sent();
                console.log("".concat(uploader.pctComplete, "% complete, ").concat(uploader.uploadedChunks, "/").concat(uploader.totalChunks));
                return [3 /*break*/, 6];
            case 8:
                console.log(assetId);
                return [4 /*yield*/, createAtomicAsset(assetId, contentType === 'application/json' ? (0, exports.generateTweetName)(content) : articleTitle, contentType === 'application/json' ? (0, exports.generateTweetName)(content) : articleTitle, contentType === 'application/json' ? 'application/json' : 'web-page', contentType, additionalPaths, poolConfig)];
            case 9:
                _a.sent();
                return [3 /*break*/, 11];
            case 10:
                err_1 = _a.sent();
                throw new Error(err_1);
            case 11: return [3 /*break*/, 13];
            case 12:
                err_2 = _a.sent();
                throw new Error(err_2);
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.createAsset = createAsset;
function createAtomicAsset(assetId, name, description, assetType, contentType, additionalPaths, poolConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var dataAndTags, atomicId, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, createDataAndTags(assetId, name, description, assetType, contentType, additionalPaths, poolConfig)];
                case 1:
                    dataAndTags = _a.sent();
                    console.log(dataAndTags);
                    return [4 /*yield*/, dispatchToBundler(dataAndTags, contentType)];
                case 2:
                    atomicId = _a.sent();
                    return [4 /*yield*/, deployToWarp(atomicId, dataAndTags, contentType)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, atomicId];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    throw new Error(e_1);
                case 5: return [2 /*return*/];
            }
        });
    });
}
function dispatchToBundler(dataAndTags, _contentType) {
    return __awaiter(this, void 0, void 0, function () {
        var data, tags, tx, id, cost, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = dataAndTags.data, tags = dataAndTags.tags;
                    tx = bundlr.createTransaction(data, { tags: tags });
                    return [4 /*yield*/, tx.sign()];
                case 1:
                    _a.sent();
                    id = tx.id;
                    return [4 /*yield*/, bundlr.getPrice(tx.size)];
                case 2:
                    cost = _a.sent();
                    console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, bundlr.fund(cost.multipliedBy(1.1).integerValue())];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    console.log("Error funding bundlr, probably not enough funds in arweave wallet...\n ".concat(e_2));
                    throw new Error(e_2);
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, tx.upload()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_3 = _a.sent();
                    console.log("Error uploading to bundlr stopping process...\n ".concat(e_3));
                    throw new Error(e_3);
                case 9:
                    console.log("BUNDLR ATOMIC ID", id);
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.dispatchToBundler = dispatchToBundler;
function deployToWarp(atomicId, dataAndTags, _contentType) {
    return __awaiter(this, void 0, void 0, function () {
        var data, tags, tx_1, price, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    data = dataAndTags.data, tags = dataAndTags.tags;
                    return [4 /*yield*/, arweave.createTransaction({ data: data })];
                case 1:
                    tx_1 = _a.sent();
                    tags.map(function (t) { return tx_1.addTag(t.name, t.value); });
                    return [4 /*yield*/, arweave.transactions.sign(tx_1, jwk)];
                case 2:
                    _a.sent();
                    tx_1.id = atomicId;
                    return [4 /*yield*/, arweave.transactions.getPrice(parseInt(tx_1.data_size))];
                case 3:
                    price = _a.sent();
                    console.log("Warp price: " + price);
                    return [4 /*yield*/, fetch(URL, {
                            method: 'POST',
                            body: JSON.stringify({ contractTx: tx_1 }),
                            headers: {
                                'Accept-Encoding': 'gzip, deflate, br',
                                'Content-Type': "application/json",
                                Accept: "application/json"
                            }
                        })];
                case 4:
                    _a.sent();
                    console.log("ATOMIC ID", tx_1.id);
                    return [2 /*return*/, { id: atomicId }];
                case 5:
                    e_4 = _a.sent();
                    console.log("Error uploading to warp...\n ".concat(e_4));
                    throw new Error(e_4);
                case 6: return [2 /*return*/];
            }
        });
    });
}
function createDataAndTags(assetId, name, description, assetType, contentType, additionalPaths, poolConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenHolder, dNow, index, paths, aType;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getRandomContributor()];
                case 1:
                    tokenHolder = _b.sent();
                    dNow = new Date().getTime();
                    index = contentType === 'application/json' ? { path: "tweet.json" } : { path: "index.html" };
                    paths = contentType === 'application/json' ? { "tweet.json": { id: assetId } } : { "index.html": { id: assetId } };
                    aType = contentType === 'application/json' ? "Alex-Messaging" : "Alex-Webpage";
                    return [2 /*return*/, {
                            data: JSON.stringify({
                                manifest: "arweave/paths",
                                version: "0.1.0",
                                index: index,
                                paths: paths
                            }),
                            tags: [
                                { name: 'App-Name', value: 'SmartWeaveContract' },
                                { name: 'App-Version', value: '0.3.0' },
                                { name: 'Content-Type', value: "application/x.arweave-manifest+json" },
                                { name: 'Contract-Src', value: poolConfig.contracts.nft.src },
                                { name: 'Pool-Id', value: poolConfig.contracts.pool.id },
                                { name: 'Title', value: name },
                                { name: 'Description', value: description },
                                { name: 'Type', value: assetType },
                                { name: 'Artifact-Series', value: "Alex." },
                                { name: 'Artifact-Name', value: name },
                                { name: 'Initial-Owner', value: tokenHolder },
                                { name: 'Date-Created', value: dNow.toString() },
                                { name: 'Artifact-Type', value: aType },
                                { name: 'Keywords', value: JSON.stringify(poolConfig.keywords) },
                                { name: 'Media-Ids', value: JSON.stringify(additionalPaths) },
                                { name: 'Implements', value: "ANS-110" },
                                { name: 'Topic', value: "Topic:" + poolConfig.keywords[0] },
                                {
                                    name: 'Init-State', value: JSON.stringify({
                                        ticker: "ATOMIC-ASSET-" + assetId,
                                        balances: (_a = {},
                                            _a[tokenHolder] = 1,
                                            _a),
                                        contentType: contentType,
                                        description: "".concat(description),
                                        lastTransferTimestamp: null,
                                        lockTime: 0,
                                        maxSupply: 1,
                                        title: "Alex Artifact - ".concat(name),
                                        name: "Artifact - ".concat(name),
                                        transferable: false,
                                        dateCreated: dNow.toString(),
                                        owner: tokenHolder
                                    })
                                }
                            ]
                        }];
            }
        });
    });
}
