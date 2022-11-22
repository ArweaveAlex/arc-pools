"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHTML = exports.run = void 0;
const fs_1 = __importDefault(require("fs"));
const wikijs_1 = __importDefault(require("wikijs"));
const client_1 = __importDefault(require("@bundlr-network/client"));
const assets_1 = require("../assets");
const gql_1 = require("../../gql");
const utils_1 = require("../../utils");
const arClient = new gql_1.ArweaveClient();
let bundlr;
let poolConfig;
let keys;
let contract;
let currentArticleURL = "";
async function run(config) {
    poolConfig = config;
    try {
        keys = JSON.parse(fs_1.default.readFileSync(poolConfig.walletPath).toString());
    }
    catch {
        (0, utils_1.exitProcess)(`Invalid Pool Wallet Configuration`, 1);
    }
    bundlr = new client_1.default(poolConfig.bundlrNode, "arweave", keys.arweave);
    contract = arClient.smartweave.contract(poolConfig.contracts.pool.id);
    let articles = [];
    for (let i = 0; i < config.keywords.length; i++) {
        let a = await (0, wikijs_1.default)({
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
            let res = await scrapePage(articles[i]);
            fs_1.default.appendFileSync('local/data/wikiarticlessent.txt', articles[i] + "\n");
            break;
        }
    }
}
exports.run = run;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const getPage = async (query) => {
    let content;
    await (0, wikijs_1.default)({ apiUrl: 'https://wikipedia.org/w/api.php' })
        .page(query)
        .then(page => page)
        .then(obj => content = obj);
    return content;
};
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
const scrapePage = async (query) => {
    try {
        const content = await getPage(query);
        currentArticleURL = content.url();
        const html = (0, exports.parseHTML)(await content.html(), content.title);
        const categories = await content.categories();
        const newCats = categories.map((word) => word.replace('Category:', ""));
        (0, assets_1.createAsset)(bundlr, arClient.arweave, arClient.smartweave, contract, html, {}, poolConfig, "text/html", `${content.title} Wikipedia Page`);
    }
    catch (err) {
        console.error(err);
    }
};
