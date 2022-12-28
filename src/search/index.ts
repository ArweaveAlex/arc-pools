import fs, { mkdirSync, RmDirOptions } from 'fs';

const cliProgress = require('cli-progress');

import { PoolConfigType } from "../types";
import { exitProcess } from "../utils";
import { checkPath, walk } from '../artifacts/miners';
import Bundlr from "@bundlr-network/client";
import { ArgumentsInterface } from '../interfaces';
import { ArweaveClient } from '../arweave-client';
import { 
    POOL_FILE, 
    POOL_SEARCH_CONTRACT_PATH, 
    TAGS,
    INDEX_FILE_DIR,
    ID_CHAR,
    OWNER_CHAR,
    FILE_INDEXES,
    INDECES_DIR,
    FINAL_INDEX_FILE_NAME,
    REDSTONE_PAGE_LIMIT
} from "../config";
import { 
    getTxEndpoint,
    getRedstoneEndpoint
} from '../utils';

const progressBar = new cliProgress.SingleBar(
    {stopOnComplete: true}, 
    cliProgress.Presets.shades_classic
);
let INDEX_COUNTER = 0;

function getPoolDir(poolId: string) {
    return INDEX_FILE_DIR + '/' + poolId;
}

function getFinalIndexFile(poolDir: string) {
    return poolDir + FINAL_INDEX_FILE_NAME;
}

function getIndecesDir(poolDir: string) {
    return poolDir + INDECES_DIR;
}

function getDataFile(poolDir: string) {
    // spread the data out over 5 index files
    let randomIndex = FILE_INDEXES[Math.floor(Math.random()*FILE_INDEXES.length)];
    return getIndecesDir(poolDir) + randomIndex;
}

export async function indexPool(
    poolConfig: PoolConfigType,
    args: ArgumentsInterface
) {
    const poolsJsonForSave = JSON.parse(fs.readFileSync(POOL_FILE).toString());
    const poolArg = args.commandValues[0];
    const arClient = new ArweaveClient();
    let poolWallet = JSON.parse(fs.readFileSync(poolConfig.walletPath).toString());


    // create the index contract from the index files
    // if it already exists create the index files 
    // and update the index contract with the new indeces
    try {

        if(!poolsJsonForSave[poolArg].contracts.poolSearchIndex){
            poolsJsonForSave[poolArg].contracts.poolSearchIndex = {
                "id": null,
                "src": null
            }
        }

        if(
            !poolsJsonForSave[poolArg].contracts.poolSearchIndex.id
            || poolsJsonForSave[poolArg].contracts.poolSearchIndex.id === ""
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

            poolsJsonForSave[poolArg].contracts.poolSearchIndex.id = poolDeployment.contractTxId;
            poolsJsonForSave[poolArg].contracts.poolSearchIndex.src = poolDeployment.srcTxId;

            fs.writeFileSync(POOL_FILE, JSON.stringify(poolsJsonForSave, null, 4));
            console.log(`Pool File Updated`);
        }

        let poolIndexId = poolsJsonForSave[poolArg].contracts.poolSearchIndex.id;

        console.log(`Top Level pool index id ${poolIndexId}`);

        const contract = arClient.warp.contract(poolIndexId)
            .connect(poolWallet)
            .setEvaluationOptions({ allowBigInt: true });

        // let currentState = (await contract.readState() as any).cachedValue.state;

        let indeces = await indexFiles(poolConfig, poolWallet);

        await contract.writeInteraction(
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

    let poolDir = getPoolDir(poolConfig.contracts.pool.id);

    if (!await checkPath(
        poolDir
    )) {
        exitProcess("Pool index directory does not exist, please please run arcpool fetch <POOL_NAME>", 1)
    }

    for await (const f of walk(getIndecesDir(poolDir))) {
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

    if (!await checkPath(INDEX_FILE_DIR)) {
        mkdirSync(INDEX_FILE_DIR);
    }

    let poolDir = getPoolDir(poolConfig.contracts.pool.id);
    let indecesDir = getIndecesDir(poolDir);

    if (!await checkPath(
        poolDir
    )) {
        mkdirSync(poolDir);
    }

    if (!await checkPath(
        indecesDir
    )) {
        mkdirSync(indecesDir);
    }

    let finalIndexFile = getFinalIndexFile(poolDir);

    let page = 1;
    let pageLimit = 0;
    let firstRun = true;
    let lastFinalIndex: any;

    if (await checkPath(
        finalIndexFile
    )) {
        lastFinalIndex = JSON.parse(
            fs.readFileSync(finalIndexFile).toString()
        );
        // console.log("Last artifact fetched - ");
        // console.log(lastFinalIndex);
        page = lastFinalIndex.page;
    }

    // // fetch every artifact for a pool
    do {
        let redstoneData = await fetch(getRedstoneEndpoint(
            poolConfig.contracts.nft.src, 
            page
        ));

        let parsed = JSON.parse(await redstoneData.text());
        let artifacts = parsed.contracts;

        pageLimit = parsed.paging.pages;

        // pick up where we left off in the page
        if(firstRun && lastFinalIndex) {
            artifacts = artifacts.slice(lastFinalIndex.indexOnPage + 1);
            INDEX_COUNTER = ((page - 1) * REDSTONE_PAGE_LIMIT) 
                            + lastFinalIndex.indexOnPage + 1;
        }

        
        if(firstRun == true) {
            let startAt = 0;
            if(lastFinalIndex) {
                startAt = ((page - 1) * REDSTONE_PAGE_LIMIT) 
                          + lastFinalIndex.indexOnPage + 1;
            }
            firstRun = false;
            progressBar.start(parsed.paging.total, startAt);
        }


        if(artifacts.length == 0) {
            console.log("\nNo new artifacts detected...");
            progressBar.stop();
            break;
        }

        extractUsefulTxt(artifacts, poolDir);

        // save the index of the final contract 
        // so we can pick up here next time
        if(page == pageLimit) {
            let finalContract = parsed.contracts[parsed.contracts.length - 1];
            finalContract.page = page;
            finalContract.indexOnPage = parsed.contracts.length - 1;
            fs.writeFile(
                finalIndexFile,
                JSON.stringify(finalContract),
                () => {}
            );
        }

        page++;

    } while (page <= pageLimit);

    
}

async function extractUsefulTxt(
    artifacts: any,
    poolDir: string
) {
    let artifactString = "";
    for(let i=0; i<artifacts.length; i++){
        INDEX_COUNTER++;
        progressBar.update(INDEX_COUNTER);
        try {
            let contractId = artifacts[i].contractId;
            let owner = artifacts[i].owner;
            let aData = await fetch(getTxEndpoint(contractId));
            let cType = aData.headers.get("Content-Type");

            if(cType.indexOf("application/json") > -1){
                let parsed = JSON.parse(await aData.text());
                let stext = parsed.text? strip(parsed.text) : "";
                let uname = parsed.user.username ? strip(parsed.user.name) : ""
                let name = parsed.user.name ? strip(parsed.user.name) : "";
                artifactString = artifactString 
                    + name
                    + uname 
                    + stext 
                    + ID_CHAR + contractId + ID_CHAR
                    + OWNER_CHAR + owner + OWNER_CHAR;
            } else if (cType.indexOf("text/html") > -1) {
                artifactString = artifactString 
                    + strip(extractWikipediaSearch(await aData.text()))
                    + ID_CHAR + contractId + ID_CHAR
                    + OWNER_CHAR + owner + OWNER_CHAR;
            }

        } catch (e: any) {
            console.log(e);
        }
    }

    let dataFile = getDataFile(poolDir);
    console.log(dataFile);
    console.log(artifactString);

    fs.appendFile(
        dataFile,
        artifactString,
        () => {}
    );

}

export async function clearLocalIndex(poolConfig: PoolConfigType) {
    let poolDir = getPoolDir(poolConfig.contracts.pool.id);

    if (!await checkPath(
        poolDir
    )) {
        console.log("Pool index directory does not exist nothing to clear");
        return;
    }

    console.log("Removing local pool index...");
    fs.rmdirSync(poolDir, { recursive: true });
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
    let articleString = "";
    var titles = article.match(/<title[^>]*>([^<]+)<\/title>/);
    if(titles.length > 0) {
        articleString = articleString + titles[1];
    }
    return articleString;
}


