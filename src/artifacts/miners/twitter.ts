
import Bundlr from "@bundlr-network/client"
import tmp from "tmp-promise"
import * as p from "path"
import { mkdir } from "fs/promises";
import { PathLike, promises, readFileSync } from "fs";
import { createWriteStream } from "fs";
import axios from "axios"
import Arweave from "arweave";
import mime from "mime-types";
import { Contract, LoggerFactory, Warp, WarpNodeFactory } from "warp-contracts";
import { createAsset } from "../assets";
import { Config, POOLS_PATH } from "../../config";
const Twitter = require('node-tweet-stream');


let tweetCount = 0;
let lockProcess = false;

const checkPath = async (path: PathLike): Promise<boolean> => { return promises.stat(path).then(_ => true).catch(_ => false) };

async function* walk(dir: string) : any {
    for await (const d of await promises.opendir(dir)) {
        const entry = p.join(dir, d.name);
        if (d.isDirectory()) yield* await walk(entry);
        else if (d.isFile()) yield entry;
    }
}

let twitter: any;
let bundlr: Bundlr
let config: Config;
let keys: any;
let arweave: Arweave;
let smartweave: Warp;
let contract: Contract;
let tweets: any[] = [];

export async function mineTweets(poolSlug: string) {
    config = JSON.parse(readFileSync(POOLS_PATH).toString())[poolSlug];

    if(!config) throw new Error("Invalid pool slug");

    keys = JSON.parse(readFileSync(config.walletPath).toString());

    twitter = new Twitter({
        consumer_key: keys.tkeys.consumer_key,
        consumer_secret: keys.tkeys.consumer_secret,
        token: keys.tkeys.token,
        token_secret: keys.tkeys.token_secret,
        tweet_mode: "extended"
    })
    bundlr = new Bundlr(config.bundlrNode, "arweave", keys.arweave);

    console.log("Bundlr balance", (await bundlr.getLoadedBalance()).toString());

    console.log(`Loaded with account address: ${bundlr.address}`)
    arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https"
    });

    smartweave = WarpNodeFactory.memCachedBased(arweave).useArweaveGateway().build();

    contract = smartweave.contract(config.pool.contract).setEvaluationOptions({
        walletBalanceUrl: config.balanceUrl
    });


    LoggerFactory.INST.logLevel("error", "DefaultStateEvaluator");
    LoggerFactory.INST.logLevel("error", "HandlerBasedContract");
    LoggerFactory.INST.logLevel("error", "HandlerExecutorFactory");

    twitter.on('tweet', listTweet);

    twitter.on('error', (e: any) => {
        console.error(`tStream error: ${e}`)
    })
    const trackKeyWords = config.keywords
    const trackUsers = config.userIDs
    console.log(`Tracking key words: ${trackKeyWords}`);
    console.log(`Tracking users: ${trackUsers}`)
    twitter.track(trackKeyWords)
    twitter.follow(trackUsers)
    setTimeout(() => {lockProcess = true; processTweets();}, 20000);
}

async function listTweet(tweet: any) {
    if (!tweet.retweeted_status && !lockProcess) {
        console.log("Pushing new tweet: " + tweet);
        tweets.push(tweet);
    }
    if(lockProcess){
        twitter.on('tweet', () => {}); 
    }
    if (!tweet.retweeted_status && !lockProcess) {
        tweetCount++;
    }
    return;
}

async function processTweets(){
    console.log(tweets.length);
    for(let i=0;i<tweets.length;i++){
        await processTweet(tweets[i]);
    }
    console.log("Finished processing all tweets...");
    process.exit(1);
}


async function processTweet(tweet: any) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });

    try {
        if (tweet?.extended_entities?.media?.length > 0) {
            try {
                const mediaDir = p.join(tmpdir.path, "media")
                if (!await checkPath(mediaDir)) {
                    await mkdir(mediaDir)
                }
                for (let i = 0; i < tweet.extended_entities.media.length; i++) {
                    const mobj = tweet.extended_entities.media[i]
                    const url = mobj.media_url
                    if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.video_info?.variants) {
                        const variants = mobj?.video_info?.variants.sort((a: any, b: any) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
                        await processMediaURL(variants[0].url, mediaDir, i)
                    } else {
                        await processMediaURL(url, mediaDir, i)
                    }
                }
            } catch (e: any) {
                console.error(`while archiving media: ${e.stack}`)
            }

        }

        if (tweet.entities.urls?.length > 0) {
            try {
                for (let i = 0; i < tweet.entities.urls.length; i++) {
                    const u = tweet.entities.urls[i]
                    const url = u.expanded_url
                    // tweets sometimes reference themselves
                    if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
                        continue;
                    }
                    const headres = await axios.head(url).catch((e) => {
                        console.log(`heading ${url} - ${e.message}`)
                    })
                    if (!headres) { continue }
                    const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html"
                    const linkPath = p.join(tmpdir.path, `/links/${i}`)
                    if (!await checkPath(linkPath)) {
                        await mkdir(linkPath, { recursive: true })
                    }
                    // if it links a web page:
                    if (contentType === "text/html") {
                        // add to article DB.
                        // await article.addUrl(url)
                    } else {
                        await processMediaURL(url, linkPath, i)
                    }
                }
            } catch (e: any) {
                console.error(`While processing URLs: ${e.stack ?? e.message}`)
            }

        }

        const subTags = [
            { name: "Application", value: "TwittAR" },
            { name: "Tweet-ID", value: `${tweet.id_str ?? "unknown"}` },
            { name: "Content-Type", value: "application/json" }
        ]

        const additionalPaths: { [key: string]: any } = {"": ""};

        for await (const f of walk(tmpdir.path)) {
            const relPath = p.relative(tmpdir.path, f)
            try {
                const mimeType = mime.contentType(mime.lookup(relPath) || "application/octet-stream") as string;
                const tx = bundlr.createTransaction(
                    await promises.readFile(p.resolve(f)), 
                    { tags: [...subTags, { name: "Content-Type", value: mimeType }] }
                )
                await tx.sign();
                const id = tx.id;
                const cost = await bundlr.getPrice(tx.size);
                console.log("Upload costs", bundlr.utils.unitConverter(cost).toString());
                console.log("Bundlr subpath upload id for tweet: " + id);
                try {
                    await bundlr.fund(cost.multipliedBy(1.1).integerValue());
                } catch (e: any){
                    console.log(`Error funding bundlr twitter.ts, probably not enough funds in arweave wallet stopping process...\n ${e}`);
                    process.exit(1);
                }
                await tx.upload();
                if (!id) { throw new Error("Upload Error") }
                additionalPaths[relPath] = { id: id };
            } catch (e: any) {
                console.log(`Error uploading ${f} for ${tweet.id_str} - ${e}`)
                continue
            }
        }

        try{
            await createAsset(
                bundlr,
                arweave,
                smartweave,
                contract,
                tweet,
                additionalPaths,
                config,
                "application/json",
                ""
            );
        } catch (e: any){
            console.log(`Error creating asset stopping processing...\n ${e}`);
            process.exit(1);
        }
        

    } catch (e: any) {
        console.log(`general error: ${e.stack ?? e.message}`)
        if (tmpdir) {
            await tmpdir.cleanup()
        }
    }
}


export async function processMediaURL(url: string, dir: string, i: number) {
    return new Promise(async (resolve, reject) => {
        const ext = url?.split("/")?.at(-1)?.split(".")?.at(1)?.split("?").at(0) ?? "unknown"
        const wstream = createWriteStream(p.join(dir, `${i}.${ext}`))
        const res = await axios.get(url, {
            responseType: "stream"
        }).catch((e) => {
            console.log(`getting ${url} - ${e.message}`)
        })
        if (!res) { return }
        await res.data.pipe(wstream) // pipe to file
        wstream.on('finish', () => {
            resolve("done")
        })
        wstream.on('error', (e) => {
            reject(e)
        })
    })

}


