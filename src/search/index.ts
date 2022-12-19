import fs, { mkdirSync } from 'fs';
import mime from "mime-types";

import { GQLResponseType, PoolConfigType } from "../types";
import { getGQLData } from "../gql";
import { POOL_FILE, POOL_SEARCH_CONTRACT_PATH, TAGS } from "../config";
import { exitProcess, getTagValue } from "../utils";
import { checkPath, walk } from '../artifacts/miners';
import Bundlr from "@bundlr-network/client";
import { ArgumentsInterface } from '../interfaces';
import { ArweaveClient } from '../arweave-client';


let FILE_DIR = "sindex";
let INDEX_COUNTER = 0;
let ID_CHAR = '`*';
let OWNER_CHAR = '`%';
let FILE_INDEXES = ['1', '2', '3', '4', '5'];
let POOL_DIR = "";


export async function indexPool(
    poolConfig: PoolConfigType,
    args: ArgumentsInterface
) {
    const poolPath: string = POOL_FILE;
    const POOLS_JSON = JSON.parse(fs.readFileSync(poolPath).toString());
    const poolArg = args.commandValues[0];
    const arClient = new ArweaveClient();
    let poolWallet = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());


    // create the index contract from the index files
    // if it already exists create the index files 
    // and update the index contract with the new indeces
    try {

        if(!POOLS_JSON[poolArg].contracts.poolSearchIndex){
            POOLS_JSON[poolArg].contracts.poolSearchIndex = {
                "id": null,
                "src": null
            }
        }

        if(
            !POOLS_JSON[poolArg].contracts.poolSearchIndex.id
            || POOLS_JSON[poolArg].contracts.poolSearchIndex.id === ""
        ) {

            // create the index contract
            const dNow = new Date().getTime();

            const tags = [
                { "name": TAGS.keys.appType, "value": "Alex-Search-Index-v0" },
                { "name": TAGS.keys.alexPoolId, "value": poolConfig.contracts.pool.id },
                { "name": "Content-Type", "value": "text/plain" },
                { "name": "Timestamp", "value": dNow.toString() }
            ];

            const poolSearchInitJson: any = {
                "owner": poolConfig.state.owner.pubkey,
                "canEvolve": true,
                "searchIndeces": []
            };

            let poolSearchSrc = fs.readFileSync(POOL_SEARCH_CONTRACT_PATH, "utf8");

            const poolSearchSrcDeployment = await arClient.warp.createContract.deploy({
                src: poolSearchSrc,
                initState: JSON.stringify({}),
                wallet: poolWallet
            });

            const poolDeployment = await arClient.warp.createContract.deployFromSourceTx({
                wallet: poolWallet,
                initState: JSON.stringify(poolSearchInitJson),
                srcTxId: poolSearchSrcDeployment.srcTxId,
                tags: tags
            });

            POOLS_JSON[poolArg].contracts.poolSearchIndex.id = poolDeployment.contractTxId;
            POOLS_JSON[poolArg].contracts.poolSearchIndex.src = poolDeployment.srcTxId;

            fs.writeFileSync(poolPath, JSON.stringify(POOLS_JSON, null, 4));
            console.log(`Pool File Updated`);
        }

        let poolIndexId = POOLS_JSON[poolArg].contracts.poolSearchIndex.id;

        console.log(`Top Level pool index id ${poolIndexId}`);

        const contract = arClient.warp.contract(poolIndexId)
            .connect(poolWallet)
            .setEvaluationOptions({ allowBigInt: true });

        // let currentState = (await contract.readState() as any).cachedValue.state;

        let indeces = await indexFiles(poolConfig, poolWallet);

        const result = await contract.writeInteraction(
            { 
                function: "update", 
                searchIndeces: indeces
            }
        );

    } catch (e: any){
        console.log(e);
        exitProcess(`Error uploading search index`, 1);
    }
}

async function indexFiles(
    poolConfig: PoolConfigType,
    poolWallet: any
) {
    let ids = [];

    for await (const f of walk(FILE_DIR)) {
        const tags = [
            { "name": TAGS.keys.appType, "value": "Alex-Search-Index-v0" },
            { "name": TAGS.keys.alexPoolId, "value": poolConfig.contracts.pool.id },
            { "name": "Content-Type", "value": "text/plain" }
        ];
    
        let bundlr = new Bundlr(poolConfig.bundlrNode, "arweave", poolWallet);
    
        const tx = bundlr.createTransaction(
            await fs.promises.readFile(f),
            { tags: tags }
        );
    
        await tx.sign();
        const id = tx.id;
        await tx.upload();
    
        console.log(`Search index id - ${id}`);
        ids.push(id);
    }

    return ids;
}

// build the search index structure for a pool
export async function fetchPool(poolConfig: PoolConfigType) {
    console.log(`Indexing pool id - ${poolConfig.contracts.pool.id}`);

    let poolId = poolConfig.contracts.pool.id;

    let cursor = null;

    if (!await checkPath(FILE_DIR)) {
        mkdirSync(FILE_DIR);
    }

    POOL_DIR = FILE_DIR + '/' + poolConfig.contracts.pool.id;

    if (!await checkPath(
        POOL_DIR
    )) {
        mkdirSync(POOL_DIR);
    }

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
            cursor = null;
        }

        extractUsefulTxt(artifacts);

    } while (cursor != null);

    
}

export function getTxEndpoint(txId: string) {
    return `https://arweave.net/${txId}`;
}

async function extractUsefulTxt(
    artifacts: GQLResponseType[]
) {
    let artifactString = "";
    for(let i=0; i<artifacts.length; i++){
        INDEX_COUNTER++;
        try {
            let aType = getTagValue(artifacts[i].node.tags, TAGS.keys.artifactType);
            let owner = getTagValue(artifacts[i].node.tags, TAGS.keys.initialOwner);
            let aData = await fetch(getTxEndpoint(artifacts[i].node.id));
            console.log(INDEX_COUNTER);
            if(aType === "Alex-Messaging"){
                let parsed = JSON.parse(await aData.text());
                let stext = parsed.text? strip(parsed.text) : "";
                let uname = parsed.user.username ? strip(parsed.user.name) : ""
                let name = parsed.user.name ? strip(parsed.user.name) : "";
                artifactString = artifactString 
                    + name 
                    + uname 
                    + stext 
                    + ID_CHAR + artifacts[i].node.id + ID_CHAR
                    + OWNER_CHAR + owner + OWNER_CHAR;
            } else if (aType === "Alex-Webpage") {
                // text = text + extractWikipediaSearch(await aData.text());
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    console.log(artifactString);

    // spread the data out over 5 index files
    let randomIndex = FILE_INDEXES[Math.floor(Math.random()*FILE_INDEXES.length)];
    let dataFile = POOL_DIR + "/" + randomIndex;

    fs.appendFile(
        dataFile,
        artifactString,
        () => {}
    );

}

function strip(s: any) {
    return s.replaceAll(' ','')
        .replaceAll('\t','')
        .replaceAll('\r','')
        .replaceAll('\n','')
        .replaceAll(ID_CHAR,'')
        .replaceAll(OWNER_CHAR,'')
        .toLowerCase();
}

function extractWikipediaSearch(article: string){
    return article;
}


