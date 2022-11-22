"use strict";
// import Bundlr from "@bundlr-network/client";
// import { Contract, Warp, WarpNodeFactory } from "warp-contracts";
// import { readFileSync } from "fs-extra";
// import WikiJS from 'wikijs';
// import fs from 'fs';
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
// let bundlr: Bundlr
// let config: Config;
// let keys: any;
// let arweave: Arweave;
// let smartweave: Warp;
// let contract: Contract;
// let currentArticleURL = "";
function run(poolConfig) {
    console.log("Run Wikipedia");
    console.log(poolConfig);
}
exports.run = run;
// function onlyUnique(value: any, index: any, self: any) {
//     return self.indexOf(value) === index;
// }
// function delay(ms: number) {
//     return new Promise( resolve => setTimeout(resolve, ms) );
// }
// const getPage = async (query: string) => {
//     let content: any;
//     await WikiJS({ apiUrl: 'https://wikipedia.org/w/api.php' })
//       .page(query)
//       .then(page => page)
//       .then(obj => content = obj);
//     return content;
// }
// function replacer(
//   match: string, 
//   p1: string, 
//   _offset: number, 
//   _string: string
// ) {
//   return match
//     .replace("#" + p1, currentArticleURL + "#" + p1)
//     .replace('<a', '<a target="_blank"');
// }
// export const parseHTML = (content: any, title: any) => {
//     var find = '<a href="/wiki';
//     var re = new RegExp(find, 'g');
//     var replace = '<a target="_blank" href="https://wikipedia.org/wiki';
//     let finalHtml = content.replace(re, replace);
//     var find2 = '<a href="#cite_note';
//     var re2 = new RegExp(find2, 'g');
//     var replace2 = '<a target="_blank" href="' + currentArticleURL + '#cite_note';
//     finalHtml = finalHtml.replace(re2, replace2);
//     var find3 = '<a href="#cite_ref';
//     var re3 = new RegExp(find3, 'g');
//     var replace3 = '<a target="_blank" href="' + currentArticleURL + '#cite_ref';
//     finalHtml = finalHtml.replace(re3, replace3);
//     let head = '<html><head><link rel="stylesheet" href="https://arweave.net/zeD-oNKfwNXE4k4-QeCAR3UZIfLXA7ettyi8qGZqd7g"><title>' + title + '</title><meta charset="UTF-8"><meta name="description" content="' + title + ' Permaweb Page"></head><body>';
//     finalHtml = head + finalHtml;
//     finalHtml = finalHtml + "</body></html>";
//     let tocReg = new RegExp('<a href="#' + '(.*)' + '"><span class="tocnumber">', 'g');
//     finalHtml = finalHtml.replace(tocReg, replacer);
//     // fs.appendFileSync('test.txt', finalHtml);
//     return finalHtml;
// }
// const scrapePage = async (query: string) => {
//     try {
//       const content = await getPage(query);
//       currentArticleURL = content.url();
//       const html = parseHTML(await content.html(), content.title);
//       const categories = await content.categories();
//       const newCats = categories.map((word: any) => word.replace('Category:', ""));
//       createAsset(
//           bundlr,
//           arweave,
//           smartweave,
//           contract,
//           html,
//           {},
//           config,
//           "text/html",
//           `${content.title} Wikipedia Page`
//       );
//     }
//     catch (err) {
//       console.error(err)
//     }
// }
// export async function mineWikipedia(poolSlug: string) {
//     config = JSON.parse(readFileSync(POOLS_PATH).toString())[poolSlug];
//     if(!config) throw new Error("Invalid pool slug");
//     keys = JSON.parse(readFileSync(config.walletPath).toString());
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
//     let articles = [];
//     for (let i = 0; i < config.keywords.length; i++) {
//       let a = await WikiJS({
//         apiUrl: 'https://wikipedia.org/w/api.php',
//         origin: null
//       }).search(config.keywords[i]);
//       articles = articles.concat(a.results);
//     }
//     articles = articles.filter(onlyUnique);
//     console.log(articles);
//     console.log("Wikipedia sent: " + articles.length);
//     let sentList = [];
//     if(fs.existsSync('local/data/wikiarticlessent.txt')){
//       sentList = fs.readFileSync('local/data/wikiarticlessent.txt').toString().split("\n");
//     }
//     console.log(sentList);
//     // loop through the api response until we find a non duplicate
//     for (let i = 0; i<articles.length; i++) {
//       if(!sentList.includes(articles[i])){
//         // await delay(6000);
//         console.log("Found non duplicate article to send: " + articles[i])
//         let res = await scrapePage(articles[i]);
//         fs.appendFileSync('local/data/wikiarticlessent.txt', articles[i] + "\n");
//         break;
//       }
//     }
// }
//# sourceMappingURL=wikipedia.js.map