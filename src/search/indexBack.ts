import tmp from "tmp-promise";
import fs, { mkdirSync } from 'fs';

import { GQLResponseType, PoolConfigType } from "../types";
import { getGQLData } from "../gql";
import { TAGS } from "../config";
import { checkPath } from "../artifacts/miners";
import { mkdir } from "fs/promises";
import * as path from "path";
import { getTagValue } from "../utils";

import { lzw } from './compressor';

let ID_CHAR = '`*';
let INDEX_COUNTER = 0;
let INDEX_OBJ = {};
let FILE_DIR = "sindexdata";
let UNCOMPRESSED_FILE = FILE_DIR + "/uncompressed";
let COMPRESSED_FILE = FILE_DIR + "/compressed";
let INDEX_FILE = FILE_DIR + "/index.json";

// build the search index structure for a pool
export async function indexPool(poolConfig: PoolConfigType) {
    console.log(`Indexing pool id - ${poolConfig.contracts.pool.id}`);

    let poolId = poolConfig.contracts.pool.id;

    let cursor = null;

    if (!await checkPath(FILE_DIR)) {
        mkdirSync(FILE_DIR);
    }

    if(!fs.existsSync(UNCOMPRESSED_FILE)){
        fs.writeFileSync(UNCOMPRESSED_FILE, "");
    }

    // // fetch every artifact for a pool
    // do {
        const artifacts: GQLResponseType[] = await getGQLData({
            ids: null,
            tagFilters: [
                {
                    name: TAGS.keys.poolId,
                    values: [
                        poolId
                    ]
                }
            ],
            uploader: null,
            cursor: cursor,
            reduxCursor: null
        }); 
        cursor = artifacts[artifacts.length - 1].cursor;

        let data = await extractUsefulTxt(artifacts);

        // fs.appendFileSync(
        //     UNCOMPRESSED_FILE, 
        //     data
        // );

    // } while (cursor != null);

    let fileData = fs.readFileSync("sindexdata/index.json");
    let compressed = lzw.encode(fileData.toString());

    fs.writeFileSync(
        COMPRESSED_FILE, 
        compressed
    );

    // fs.writeFileSync(
    //     INDEX_FILE, 
    //     JSON.stringify(INDEX_OBJ)
    // );
    
    // create top level search contract
    // maintains a list of index contracts per pool

    // fetch every artifact
    // extract the "searchable" info from each one
    // concat searchable together
    // place them together with terminating character
    // compress them
    // tie id to indeces where terminating character is in the loop
    // store that dict and compressed data in a contract
    // using a set height for the contract
    // store that contract for the language on the top level

    // index again
    // start at last artifact cursor
    // use a set height

    // searching
    // narrow down to the list of index contracts
    // process them async
}

export function getTxEndpoint(txId: string) {
    return `https://arweave.net/${txId}`;
}

async function extractUsefulTxt(artifacts: GQLResponseType[]) {
    let text: string;
    for(let i=0; i<artifacts.length; i++){
        INDEX_COUNTER++;
        try {
            let aType = getTagValue(artifacts[i].node.tags, TAGS.keys.artifactType);
            INDEX_OBJ[artifacts[i].node.id] = artifacts[i].node.id;
            let aData = await fetch(getTxEndpoint(artifacts[i].node.id));
            if(aType === "Alex-Messaging"){
                text = text + extractTweetSearch(await aData.text());
            } else if (aType === "Alex-Webpage") {
                text = text + extractWikipediaSearch(await aData.text());
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    return text;
}

function strip(s: any) {
    return s.replaceAll(' ','')
        .replaceAll('\t','')
        .replaceAll('\r','')
        .replaceAll('\n','');
}

function extractTweetSearch(tweet: string){
    let parsed = JSON.parse(tweet);

    let ftext = parsed.full_text ? strip(parsed.full_text) : "";
    let stext = parsed.text? strip(parsed.text) : "";
    let uname = parsed.user.username ? strip(parsed.user.name) : ""
    let uid = parsed.user.id ? strip(parsed.user.id) : "";
    let name = parsed.user.name ? strip(parsed.user.name) : "";

    let fullData = stext + ftext + uname + uid + name;
    fullData = fullData.replaceAll(ID_CHAR,'') + ID_CHAR + INDEX_COUNTER;

    return fullData;
}

function extractWikipediaSearch(article: string){
    return article;
}


