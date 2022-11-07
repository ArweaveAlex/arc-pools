import { readFileSync } from "fs-extra";
import WikiJS from 'wikijs';
import fs from 'fs';

import { fromHtml } from "hast-util-from-html";
// import { toHtml } from "hast-util-to-html";
// import { map } from 'unist-util-map';
// import { h } from 'hastscript';

import { createAsset } from "../assets";
import { Config, POOLS_PATH } from "../../config";
import Arweave from "arweave";

let config:Config;
const jwk = JSON.parse(fs.readFileSync("local/wallets/wallet.json").toString());
const arweave = Arweave.init({
  host: 'arweave.net',
  port: '443',
  protocol: 'https'
});

function onlyUnique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const getPage = async (query: string) => {
    let content: any;
  
    await WikiJS({ apiUrl: 'https://wikipedia.org/w/api.php' })
      .page(query)
      .then(page => page)
      .then(obj => content = obj);
  
    return content;
}

export const parseHTML = (content: any, title: any) => {
    // const tree = fromHtml(content)
    // const newTree = map(tree, node => {
    //   if (node.type === 'element' && node.tagName === 'head') {
    //     node.children =
    //       [
    //         h('link', { rel: 'stylesheet', href: 'https://arweave.net/zeD-oNKfwNXE4k4-QeCAR3UZIfLXA7ettyi8qGZqd7g' }),
    //         h('title', title),
    //         h('meta', { charset: 'UTF-8' }),
    //         h('meta', { name: "description", content: `${title} Permaweb Page` })
    //       ]
    //   }
    //   if (node.type === 'element' && ['a', 'img'].includes(node.tagName)) {
    //     if (node?.properties?.href && typeof node?.properties?.href == 'string' && node?.properties?.href.match("\^/wiki{0,}")) {
    //       node.properties.href = "https://wikipedia.org" + node.properties.href;
    //     }
    //   }
  
    //   return node
    // })
  
    // return toHtml(newTree)
  }

const scrapePage = async (query: string) => {
    try {
      const content = await getPage(query);
      const html = parseHTML(await content.html(), content.title);
      const categories = await content.categories();
      const newCats = categories.map((word: any) => word.replace('Category:', ""));
    //   const tx = await arweave.createTransaction({
    //     data: html
    //   }, jwk)
    //   tx.addTag('Content-Type', 'text/html');
  
      try {
        // await arweave.transactions.sign(tx, jwk);
        // const assetId = tx.id;
        // await arweave.transactions.post(tx);
        // console.log(content.title, assetId);
        // const res = await createAtomicAsset(
        //     assetId, 
        //     content.title, 
        //     `${content.title} Wikipedia Page`, 
        //     'web-page', 
        //     'text/html', 
        //     newCats
        // );
        // return res;
      } catch (err) {
        console.log(err)
      }
    }
    catch (err) {
      console.error(err)
    }
}

export async function mineWikipedia(poolSlug: string) {
    config = JSON.parse(readFileSync(POOLS_PATH).toString())[poolSlug];
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
    fs.writeFileSync('local/data/wikiarticles.txt', JSON.stringify(articles));
    console.log("Processing articles: " + articles.length);
  
    for (let i = 0; i < articles.length; i++) {
      await delay(6000);
      console.log(articles[i])
      let res = await scrapePage(articles[i]);
    }
}