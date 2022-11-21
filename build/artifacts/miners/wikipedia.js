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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.mineWikipedia = exports.parseHTML = void 0;
var client_1 = __importDefault(require("@bundlr-network/client"));
var warp_contracts_1 = require("warp-contracts");
var fs_extra_1 = require("fs-extra");
var wikijs_1 = __importDefault(require("wikijs"));
var fs_1 = __importDefault(require("fs"));
var assets_1 = require("../assets");
var config_1 = require("../../config");
var arweave_1 = __importDefault(require("arweave"));
var bundlr;
var config;
var keys;
var arweave;
var smartweave;
var contract;
var currentArticleURL = "";
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var getPage = function (query) { return __awaiter(void 0, void 0, void 0, function () {
    var content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, wikijs_1["default"])({ apiUrl: 'https://wikipedia.org/w/api.php' })
                    .page(query)
                    .then(function (page) { return page; })
                    .then(function (obj) { return content = obj; })];
            case 1:
                _a.sent();
                return [2 /*return*/, content];
        }
    });
}); };
function replacer(match, p1, _offset, _string) {
    return match
        .replace("#" + p1, currentArticleURL + "#" + p1)
        .replace('<a', '<a target="_blank"');
}
var parseHTML = function (content, title) {
    var find = '<a href="/wiki';
    var re = new RegExp(find, 'g');
    var replace = '<a target="_blank" href="https://wikipedia.org/wiki';
    var finalHtml = content.replace(re, replace);
    var find2 = '<a href="#cite_note';
    var re2 = new RegExp(find2, 'g');
    var replace2 = '<a target="_blank" href="' + currentArticleURL + '#cite_note';
    finalHtml = finalHtml.replace(re2, replace2);
    var find3 = '<a href="#cite_ref';
    var re3 = new RegExp(find3, 'g');
    var replace3 = '<a target="_blank" href="' + currentArticleURL + '#cite_ref';
    finalHtml = finalHtml.replace(re3, replace3);
    var head = '<html><head><link rel="stylesheet" href="https://arweave.net/zeD-oNKfwNXE4k4-QeCAR3UZIfLXA7ettyi8qGZqd7g"><title>' + title + '</title><meta charset="UTF-8"><meta name="description" content="' + title + ' Permaweb Page"></head><body>';
    finalHtml = head + finalHtml;
    finalHtml = finalHtml + "</body></html>";
    var tocReg = new RegExp('<a href="#' + '(.*)' + '"><span class="tocnumber">', 'g');
    finalHtml = finalHtml.replace(tocReg, replacer);
    // fs.appendFileSync('test.txt', finalHtml);
    return finalHtml;
};
exports.parseHTML = parseHTML;
var scrapePage = function (query) { return __awaiter(void 0, void 0, void 0, function () {
    var content, html, _a, categories, newCats, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, getPage(query)];
            case 1:
                content = _b.sent();
                currentArticleURL = content.url();
                _a = exports.parseHTML;
                return [4 /*yield*/, content.html()];
            case 2:
                html = _a.apply(void 0, [_b.sent(), content.title]);
                return [4 /*yield*/, content.categories()];
            case 3:
                categories = _b.sent();
                newCats = categories.map(function (word) { return word.replace('Category:', ""); });
                (0, assets_1.createAsset)(bundlr, arweave, smartweave, contract, html, {}, config, "text/html", "".concat(content.title, " Wikipedia Page"));
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                console.error(err_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
function mineWikipedia(poolSlug) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, articles, i, a, sentList, i, res;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    config = JSON.parse((0, fs_extra_1.readFileSync)(config_1.POOLS_PATH).toString())[poolSlug];
                    if (!config)
                        throw new Error("Invalid pool slug");
                    keys = JSON.parse((0, fs_extra_1.readFileSync)(config.walletPath).toString());
                    bundlr = new client_1["default"](config.bundlrNode, "arweave", keys.arweave);
                    _b = (_a = console).log;
                    _c = ["Bundlr balance"];
                    return [4 /*yield*/, bundlr.getLoadedBalance()];
                case 1:
                    _b.apply(_a, _c.concat([(_d.sent()).toString()]));
                    console.log("Loaded with account address: ".concat(bundlr.address));
                    arweave = arweave_1["default"].init({
                        host: "arweave.net",
                        port: 443,
                        protocol: "https"
                    });
                    smartweave = warp_contracts_1.WarpNodeFactory.memCachedBased(arweave).useArweaveGateway().build();
                    contract = smartweave.contract(config.pool.contract).setEvaluationOptions({
                        walletBalanceUrl: config.balanceUrl
                    });
                    articles = [];
                    i = 0;
                    _d.label = 2;
                case 2:
                    if (!(i < config.keywords.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, wikijs_1["default"])({
                            apiUrl: 'https://wikipedia.org/w/api.php',
                            origin: null
                        }).search(config.keywords[i])];
                case 3:
                    a = _d.sent();
                    articles = articles.concat(a.results);
                    _d.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    articles = articles.filter(onlyUnique);
                    console.log(articles);
                    console.log("Wikipedia sent: " + articles.length);
                    sentList = [];
                    if (fs_1["default"].existsSync('local/data/wikiarticlessent.txt')) {
                        sentList = fs_1["default"].readFileSync('local/data/wikiarticlessent.txt').toString().split("\n");
                    }
                    console.log(sentList);
                    i = 0;
                    _d.label = 6;
                case 6:
                    if (!(i < articles.length)) return [3 /*break*/, 9];
                    if (!!sentList.includes(articles[i])) return [3 /*break*/, 8];
                    // await delay(6000);
                    console.log("Found non duplicate article to send: " + articles[i]);
                    return [4 /*yield*/, scrapePage(articles[i])];
                case 7:
                    res = _d.sent();
                    fs_1["default"].appendFileSync('local/data/wikiarticlessent.txt', articles[i] + "\n");
                    return [3 /*break*/, 9];
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.mineWikipedia = mineWikipedia;
