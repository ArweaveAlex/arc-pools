import * as fs from "fs";
import path, * as p from "path";
import axios from "axios";
import clc from "cli-color";
import mime from "mime-types";

import { STORAGE, CONTENT_TYPES, TAGS } from "./config";
import { IPoolClient, KeyValueType } from "./types";

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

export async function processMediaURL(url: string, dir: string, i: number) {
  return new Promise(async (resolve, reject) => {
    console.log("url: " + url);
    const fileName = url.split("/").pop();
    console.log("Before extension extraction: ", fileName);
    const ext = fileName.split(".").slice(-1)[0].split("?")[0] || "unknown";
    const contentType = mime.lookup(ext) || "application/octet-stream";
    console.log("After extension extraction: ", ext);
    const wstream = fs.createWriteStream(p.join(dir, `${i}.${ext}`))
    const res = await axios.get(url, {
      responseType: "stream",
      headers: {
        "Content-Type": contentType
      }
    }).catch((e) => {
      log(`Getting ${url} - ${e.message}`, null);
    })
    if (!res) { return }
    await res.data.pipe(wstream)
    wstream.on("finish", () => {
      console.log("done")
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
        const mimeType = mime.contentType(mime.lookup(relPath) || CONTENT_TYPES.octetStream) as string;
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

export function generateRedditAssetName(_post: any) {
  return "Reddit Name";
}

export const generateRedditAssetDescription = (_post: any) => {
  return "Reddit Description";
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