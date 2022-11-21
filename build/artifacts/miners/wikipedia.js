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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mineWikipedia = exports.parseHTML = void 0;
const client_1 = __importDefault(require("@bundlr-network/client"));
const warp_contracts_1 = require("warp-contracts");
const fs_extra_1 = require("fs-extra");
const wikijs_1 = __importDefault(require("wikijs"));
const fs_1 = __importDefault(require("fs"));
const assets_1 = require("../assets");
const config_1 = require("../../config");
const arweave_1 = __importDefault(require("arweave"));
let bundlr;
let config;
let keys;
let arweave;
let smartweave;
let contract;
let currentArticleURL = "";
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const getPage = (query) => __awaiter(void 0, void 0, void 0, function* () {
    let content;
    yield (0, wikijs_1.default)({ apiUrl: 'https://wikipedia.org/w/api.php' })
        .page(query)
        .then(page => page)
        .then(obj => content = obj);
    return content;
});
function replacer(match, p1, _offset, _string) {
    return match
        .replace("#" + p1, currentArticleURL + "#" + p1)
        .replace('<a', '<a target="_blank"');
}
const parseHTML = (content, title) => {
    var find = '<a href="/wiki';
    var re = new RegExp(find, 'g');
    var replace = '<a target="_blank" href="https://wikipedia.org/wiki';
    let finalHtml = content.replace(re, replace);
    var find2 = '<a href="#cite_note';
    var re2 = new RegExp(find2, 'g');
    var replace2 = '<a target="_blank" href="' + currentArticleURL + '#cite_note';
    finalHtml = finalHtml.replace(re2, replace2);
    var find3 = '<a href="#cite_ref';
    var re3 = new RegExp(find3, 'g');
    var replace3 = '<a target="_blank" href="' + currentArticleURL + '#cite_ref';
    finalHtml = finalHtml.replace(re3, replace3);
    let head = '<html><head><link rel="stylesheet" href="https://arweave.net/zeD-oNKfwNXE4k4-QeCAR3UZIfLXA7ettyi8qGZqd7g"><title>' + title + '</title><meta charset="UTF-8"><meta name="description" content="' + title + ' Permaweb Page"></head><body>';
    finalHtml = head + finalHtml;
    finalHtml = finalHtml + "</body></html>";
    let tocReg = new RegExp('<a href="#' + '(.*)' + '"><span class="tocnumber">', 'g');
    finalHtml = finalHtml.replace(tocReg, replacer);
    // fs.appendFileSync('test.txt', finalHtml);
    return finalHtml;
};
exports.parseHTML = parseHTML;
const scrapePage = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content = yield getPage(query);
        currentArticleURL = content.url();
        const html = (0, exports.parseHTML)(yield content.html(), content.title);
        const categories = yield content.categories();
        const newCats = categories.map((word) => word.replace('Category:', ""));
        (0, assets_1.createAsset)(bundlr, arweave, smartweave, contract, html, {}, config, "text/html", `${content.title} Wikipedia Page`);
    }
    catch (err) {
        console.error(err);
    }
});
function mineWikipedia(poolSlug) {
    return __awaiter(this, void 0, void 0, function* () {
        config = JSON.parse((0, fs_extra_1.readFileSync)(config_1.POOLS_PATH).toString())[poolSlug];
        if (!config)
            throw new Error("Invalid pool slug");
        keys = JSON.parse((0, fs_extra_1.readFileSync)(config.walletPath).toString());
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
        let articles = [];
        for (let i = 0; i < config.keywords.length; i++) {
            let a = yield (0, wikijs_1.default)({
                apiUrl: 'https://wikipedia.org/w/api.php',
                origin: null
            }).search(config.keywords[i]);
            articles = articles.concat(a.results);
        }
        articles = articles.filter(onlyUnique);
        console.log(articles);
        console.log("Wikipedia sent: " + articles.length);
        let sentList = [];
        if (fs_1.default.existsSync('local/data/wikiarticlessent.txt')) {
            sentList = fs_1.default.readFileSync('local/data/wikiarticlessent.txt').toString().split("\n");
        }
        console.log(sentList);
        // loop through the api response until we find a non duplicate
        for (let i = 0; i < articles.length; i++) {
            if (!sentList.includes(articles[i])) {
                // await delay(6000);
                console.log("Found non duplicate article to send: " + articles[i]);
                let res = yield scrapePage(articles[i]);
                fs_1.default.appendFileSync('local/data/wikiarticlessent.txt', articles[i] + "\n");
                break;
            }
        }
    });
}
exports.mineWikipedia = mineWikipedia;
