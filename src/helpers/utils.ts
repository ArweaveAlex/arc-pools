import * as fs from "fs";
import * as p from "path";
import axios from "axios";
import clc from "cli-color";

import { STORAGE } from "./config";
import { KeyValueType } from "./types";

export function exitProcess(message: string, status: 0 | 1): void {
    console.log(status === 0 ? clc.green(message) : clc.red(message));
    process.exit(status);
}

export function displayJsonUpdate(poolTitle: string, key: string, value: string): void {
    console.log(`Updating ${poolTitle} JSON Object - ${key} - [`, clc.green(`'${value}'`), `]`);
}

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

export function truncateString(str: string, num: number) {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    } else {
      return str;
    }
  }
  
  export const checkPath = async (path: fs.PathLike): Promise<boolean> => { return fs.promises.stat(path).then(_ => true).catch(_ => false) };

  export async function* walk(dir: string) : any {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = p.join(dir, d.name);
        if (d.isDirectory()) yield* await walk(entry);
        else if (d.isFile()) yield entry;
    }
}

export async function processMediaURL(url: string, dir: string, i: number) {
    return new Promise(async (resolve, reject) => {
        const ext = url?.split("/")?.at(-1)?.split(".")?.at(1)?.split("?").at(0) ?? "unknown"
        const wstream = fs.createWriteStream(p.join(dir, `${i}.${ext}`))
        const res = await axios.get(url, {
            responseType: "stream"
        }).catch((e) => {
            console.log(`Getting ${url} - ${e.message}`)
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

export function generateAssetName(tweet: any) {
    if (tweet) {
      if (tweet.text) {
        if (tweet.text.length > 30) {
          return `Username: ${tweet.user.name}, Tweet: ${truncateString(tweet.text, 30)}`
        } else {
          return `Username: ${tweet.user.name}, Tweet: ${tweet.text}`
        }
      } else if (tweet.full_text) {
        if (tweet.full_text.length > 30) {
          return `Username: ${tweet.user.name}, Tweet: ${truncateString(tweet.full_text, 30)}`
        } else {
          return `Username: ${tweet.user.name}, Tweet: ${tweet.full_text}`
        }
      } else {
        return `Username: ${tweet.user.name}, Tweet: ${tweet.id}`
      }
    }
    else {
      return 'Username: unknown'
    }
  }
  
  export const generateAssetDescription = (tweet: any) => {
    if (tweet.full_text) {
     return tweet.full_text;
   } else if(tweet.text){
     return tweet.text;
   } else {
    return generateAssetName(tweet);
   }
  }