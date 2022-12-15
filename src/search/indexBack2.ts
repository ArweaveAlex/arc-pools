import fs, { mkdirSync } from 'fs';
import { GQLResponseType, PoolConfigType } from "../types";
import { getGQLData } from "../gql";
import { TAGS } from "../config";
import { getTagValue } from "../utils";
import { checkPath } from '../artifacts/miners';


let INDEX_OBJ = {};
let FILE_DIR = "sindexdata";
let INDEX_FILE = FILE_DIR + "/index.json";
let INDEX_COUNTER = 0;

// build the search index structure for a pool
export async function indexPool(poolConfig: PoolConfigType) {
    console.log(`Indexing pool id - ${poolConfig.contracts.pool.id}`);

    let poolId = poolConfig.contracts.pool.id;

    let cursor = null;

    if (!await checkPath(FILE_DIR)) {
        mkdirSync(FILE_DIR);
    }

    let firstRun = true;

    // // fetch every artifact for a pool
    do {
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
        if(artifacts[artifacts.length - 1]){
            cursor = artifacts[artifacts.length - 1].cursor; 
        } else {
            fs.writeFileSync(
                INDEX_FILE, 
                JSON.stringify(INDEX_OBJ)
            );
            break;
        }

        extractUsefulTxt(artifacts, () => {
            
        }, cursor, firstRun);

        firstRun = false;
    } while (cursor != null);

    
}

export function getTxEndpoint(txId: string) {
    return `https://arweave.net/${txId}`;
}

async function extractUsefulTxt(
    artifacts: GQLResponseType[], 
    callBack: any, 
    cursor: string, 
    firstRun: boolean
) {
    let text: string;
    for(let i=0; i<artifacts.length; i++){
        INDEX_COUNTER++;
        try {
            let aType = getTagValue(artifacts[i].node.tags, TAGS.keys.artifactType);
            let aData = await fetch(getTxEndpoint(artifacts[i].node.id));
            console.log(INDEX_COUNTER);
            if(aType === "Alex-Messaging"){
                let parsed = JSON.parse(await aData.text());
                let stext = parsed.text? strip(parsed.text) : "";
                let uname = parsed.user.username ? strip(parsed.user.name) : ""
                let name = parsed.user.name ? strip(parsed.user.name) : "";
                INDEX_OBJ[artifacts[i].node.id] = {
                    s: name + uname + stext
                };
            } else if (aType === "Alex-Webpage") {
                // text = text + extractWikipediaSearch(await aData.text());
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    if(!firstRun && cursor == null){
        callBack();
    }

}

function strip(s: any) {
    return s.replaceAll(' ','')
        .replaceAll('\t','')
        .replaceAll('\r','')
        .replaceAll('\n','');
}

function extractWikipediaSearch(article: string){
    return article;
}


