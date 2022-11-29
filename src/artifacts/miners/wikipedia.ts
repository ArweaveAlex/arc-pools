import fs from "fs";
import WikiJS from "wikijs";

import Bundlr from "@bundlr-network/client";
import { Contract } from "warp-contracts";

import { createAsset } from "../assets";
import { ArweaveClient } from "../../gql";
import { exitProcess } from "../../utils";
import { PoolConfigType } from "../../types";

const arClient = new ArweaveClient();

let bundlr: Bundlr
let poolConfig: PoolConfigType;
let keys: any;
let contract: Contract;

let currentArticleURL = "";

export async function run(config: PoolConfigType) {
  poolConfig = config;

  try {
    console.log(poolConfig);
    console.log(poolConfig.walletPath);
    console.log(fs.readFileSync(poolConfig.walletPath));
    keys = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());
  }
  catch {
    exitProcess(`Invalid Pool Wallet Configuration`, 1);
  }
  bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", keys);

  contract = arClient.smartweave.contract(poolConfig.contracts.pool.id);

  let articles = [];
  for (let i = 0; i < config.keywords.length; i++) {

    let a = await WikiJS({
      apiUrl: 'https://wikipedia.org/w/api.php',
      origin: null
    }).search(config.keywords[i]);
    articles = articles.concat(a.results);
  }

  articles = articles.filter(onlyUnique);

  console.log(articles);
  console.log("Wikipedia sent: " + articles.length);

  let sentList = [];

  if(!fs.existsSync('data')){
    fs.mkdirSync('data');
  }

  if(!fs.existsSync('data/wikiarticlessent.txt')){
    fs.writeFileSync('data/wikiarticlessent.txt', "");
  }

  sentList = fs.readFileSync('data/wikiarticlessent.txt').toString().split("\n");
  console.log(sentList);

  // loop through the api response until we find a non duplicate
  for (let i = 0; i < articles.length; i++) {
    if (!sentList.includes(articles[i])) {
      // await delay(6000);
      console.log("Found non duplicate article to send: " + articles[i])
      let res = await scrapePage(articles[i]);
      fs.appendFileSync('data/wikiarticlessent.txt', articles[i] + "\n");
      break;
    }
  }
}

function onlyUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getPage = async (query: string) => {
  let content: any;

  await WikiJS({ apiUrl: 'https://wikipedia.org/w/api.php' })
    .page(query)
    .then(page => page)
    .then(obj => content = obj);

  return content;
}

function replacer(
  match: string,
  p1: string,
  _offset: number,
  _string: string
) {
  return match
    .replace("#" + p1, currentArticleURL + "#" + p1)
    .replace('<a', '<a target="_blank"');
}

export const parseHTML = (content: any, title: any) => {
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
}

const scrapePage = async (query: string) => {
  try {
    const content = await getPage(query);
    currentArticleURL = content.url();
    const html = parseHTML(await content.html(), content.title);
    const categories = await content.categories();
    const newCats = categories.map((word: any) => word.replace('Category:', ""));

    createAsset(
      bundlr,
      contract,
      html,
      {},
      poolConfig,
      "text/html",
      `${content.title} Wikipedia Page`
    );
  }
  catch (err) {
    console.error(err)
  }
}