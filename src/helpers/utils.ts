import * as fs from "fs";
import path, * as p from "path";
import axios from "axios";
import clc from "cli-color";
import mime from "mime-types";
import { mkdir } from "fs/promises";

var crypto = require("crypto");

import { STORAGE, CONTENT_TYPES, TAGS, POOL_FILE } from "./config";
import { IPoolClient, KeyValueType, PoolConfigType } from "./types";

export function getTagValue(list: KeyValueType[], name: string): string {
  for (let i = 0; i < list.length; i++) {
    if (list[i]) {
      if (list[i]!.name === name) {
        return list[i]!.value as string;
      }
    }
  }
  return STORAGE.none;
}

export function unquoteJsonKeys(json: Object): string {
  return JSON.stringify(json).replace(/"([^"]+)":/g, '$1:')
}

export function checkProcessEnv(processArg: string): string {
  return processArg.indexOf("ts-node") > -1 ? '.ts' : '.js'
}

export const checkPath = async (path: fs.PathLike): Promise<boolean> => { return fs.promises.stat(path).then(_ => true).catch(_ => false) };

export async function* walk(dir: string): any {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = p.join(dir, d.name);
    if (d.isDirectory()) yield* await walk(entry);
    else if (d.isFile()) yield entry;
  }
}

export function getExtFromURL(url: string) {
  const ext = url?.split("/")?.at(-1)?.split(".")?.at(1)?.split("?").at(0) ?? "unknown";
  return ext;
}

export async function processMediaURL(url: string, dir: string, i: number) {
  return new Promise(async (resolve, reject) => {
    const ext = getExtFromURL(url);
    const wstream = fs.createWriteStream(p.join(dir, `${i}.${ext}`));
    const res = await axios.get(url, {
      responseType: "stream"
    }).catch((e) => {
      log(`Getting ${url} - ${e.message}`, 1);
    })
    if (!res) { return }
    await res.data.pipe(wstream)
    wstream.on("finish", () => {
      resolve("Done")
    })
    wstream.on("error", (e) => {
      reject(e)
    })
  })
}

export async function processMediaPaths(poolClient: IPoolClient, args: {
  subTags: any,
  tmpdir: any,
  path: string
}) {

  const additionalMediaPaths: { [key: string]: any } = {};
  const dir = `${args.tmpdir.path}/${args.path}`;
  
  if (await checkPath(dir)) {
    for await (const f of walk(dir)) {
      const relPath = path.relative(args.tmpdir.path, f)
      try {
        let id = await processMediaPath(
          poolClient,
          f,
          args
        );
        additionalMediaPaths[relPath] = { id: id };
      }
      catch (e: any) {
        fs.rmSync(path.resolve(f));
        log(`Error uploading ${f} for ${JSON.stringify(args)} - ${e}`, 1);
      }
    }
  }

  return additionalMediaPaths;
}

export async function processMediaPath(poolClient: IPoolClient, f: string, args: {
  subTags: any,
  tmpdir: any,
  path: string
}) {
  const mimeType = mime.contentType(mime.lookup(f) || CONTENT_TYPES.octetStream) as string;
  const tx = poolClient.bundlr.createTransaction(
    await fs.promises.readFile(path.resolve(f)),
    { tags: [...args.subTags, { name: TAGS.keys.contentType, value: mimeType }] }
  )
  await tx.sign();
  const id = tx.id;
  const cost = await poolClient.bundlr.getPrice(tx.size);
  fs.rmSync(path.resolve(f));
  try {
    await poolClient.bundlr.fund(cost.multipliedBy(1.1).integerValue());
  }
  catch (e: any) {
    log(`Error funding bundlr ...\n ${e}`, 1);
  }
  await tx.upload();
  if (!id) exitProcess(`Upload Error`, 1);
  return id;
}

export function generateAssetName(tweet: any) {
  if (tweet && (tweet.text || tweet.full_text)) {
    const tweetText = tweet.text ? tweet.text : tweet.full_text;
    return `Username: ${removeEmojis(tweet.user.name)}, Tweet: ${modifyString(tweetText, (tweetText.length > 30 ? 30 : tweetText.length))}`;
  }
  else {
    return `Username: unknown`;
  }
}

export const generateAssetDescription = (tweet: any) => {
  if (tweet && (tweet.text || tweet.full_text)) {
    const tweetText = tweet.text ? tweet.text : tweet.full_text;
    return modifyString(tweetText, tweetText.length);
  }
  else {
    return generateAssetName(tweet);
  }
}

export function generateRedditAssetName(post: any) {
  let title = post[0].data.children[0].data.title;
  if(title) {
    return `Reddit Post: ${modifyString(title, (title.length > 30 ? 30 : title.length))}`;
  } else {
    return `Reddit Post`;
  }
}

export const generateRedditAssetDescription = (post: any) => {
  let selftext = post[0].data.children[0].data.selftext;
  let title = post[0].data.children[0].data.title;
  if(selftext){
    return `${modifyString(selftext, (selftext.length > 200 ? 200 : selftext.length))}`;
  } else {
    if(title) {
      return `${title}`;
    } else {
      return "Reddit post"
    }
  }
}

export function generateNostrAssetName(event: any) {
  let content = event.content;
  let pubkey = event.pubkey;
  let truncPubKey = modifyString(pubkey, (pubkey.length > 5 ? 5 : pubkey.length));
  let truncContent = modifyString(content, (content.length > 20 ? 20 : content.length));
  if(content){
    return `Nostr Pubkey: ${truncPubKey} Nostr Event: ${truncContent}`;
  } 
  return "Nostr event";
}

export function generateNostrAssetDescription(event: any) {
  let content = event.content;
  if(content){
    return `Nostr event: ${modifyString(content, (content.length > 200 ? 200 : content.length))}`;
  } 
  return "Nostr event";
}

export function modifyString(str: string, num: number) {
  let finalStr: string = "";
  if (str.length > num) {
    for (let i = 0; i < num; i++) {
      finalStr += Array.from(str)[i];
    }
    return removeEmojis(`${finalStr} ...`).replace(/(\r\n|\r|\n)/g, " ");
  }
  else {
    for (let i = 0; i < str.length; i++) {
      finalStr += Array.from(str)[i];
    }
    return removeEmojis(finalStr).replace(/(\r\n|\r|\n)/g, " ");
  }
}

function removeEmojis(string: string) {
  const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return string.replace(regex, "");
}

export function log(message: any, status: 0 | 1 | null): void {
  if (status !== null) {
    console.log(status === 0 ? clc.green(message) : clc.red(message));
  }
  else {
    console.log(message);
  }
}

export function logValue(message: any, value: any, status: 0 | 1 | null): void {
  if (status !== null) {
    console.log(`${message} - [`, status === 0 ? clc.green(`'${value}'`) : clc.red(`'${value}'`), `]`);
  }
  else {
    console.log(`${message} - ['${value}']`);
  }
}

export function logJsonUpdate(poolTitle: string, key: string, value: string): void {
  console.log(`Updating ${poolTitle} JSON Object - ${key} - [`, clc.green(`'${value}'`), `]`);
}


export function exitProcess(message: string, status: 0 | 1): void {
  console.log(status === 0 ? clc.green(message) : clc.red(message));
  process.exit(status);
}

export async function traverse(callBackFields: string[], obj: any, callBack: any) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if(callBackFields.includes(key)){
          await callBack(obj[key], key);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          await traverse(callBackFields, obj[key], callBack);
      } 
    }
  }
}

export function prettyPrint(obj: any){
  return JSON.stringify(obj, null, 4);
}

export function saveConfig(config: PoolConfigType, poolLabel: string){
  const pools_obj = JSON.parse(fs.readFileSync(POOL_FILE).toString());
  pools_obj[poolLabel] = config;
  fs.writeFileSync(POOL_FILE, prettyPrint(pools_obj));
};

export async function uploadFile(poolClient: IPoolClient, mediaDir: string, url: string, args: {
  tmpdir: any,
  contentModeration: boolean,
  tags: any[]
}) {
  try {
      if (!await checkPath(mediaDir)) {
          await mkdir(mediaDir);
      }
  
      let randomFileIndex = Math.floor(Math.random() * 10000000000);
      const ext = getExtFromURL(url);
      let fullFilePath = path.join(mediaDir, `${randomFileIndex}.${ext}`);
  
      await processMediaURL(url, mediaDir, randomFileIndex);

  
      let txId = await processMediaPath(
          poolClient, 
          fullFilePath,
          {subTags: args.tags, tmpdir: args.tmpdir, path: "media"}
      );
  
      return txId;
  } catch(e: any) {
      console.log(e);
  }

  return null;
}

export function sha256Object(obj: any) {
  var serializedObj = JSON.stringify(obj);
  var hash = crypto.createHash("sha256");
  hash.update(serializedObj);
  var eventId = hash.digest("hex");
  return eventId;
}