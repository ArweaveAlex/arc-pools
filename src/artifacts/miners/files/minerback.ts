import * as fs from "fs";

import minimist from "minimist";

import { PoolClient } from "../../../clients/pool";


import { exitProcess, findFileAbsolutePath, processMediaPath } from "../../../helpers/utils";
import { ArtifactEnum, IPoolClient, PoolConfigType } from "../../../helpers/types";
import { CONTENT_TYPES, TAGS } from "../../../helpers/config";
import { createAsset } from "../..";

// state for building association sequences by collection
// and where to pick up in the file
const filePath = './sequence.json';
let associationIdsByCollection = {
    lastIndexProcessed: -1
};

// read a whole directory or a file
// put config file in top level of directory or next to file
// generate config file
// default file information if there is no configs
// do all files in the directory with defaults
// extract file type from file extension
// get rid of sequence.json store all the files sent in a file next to the metadata config file

if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  associationIdsByCollection = JSON.parse(fileData);
} else {
  console.log('File not found or is not a file.');
}

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolClient.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining files");

    const fileDir = argv["file-dir"];
    const fileConfig = argv["file-config"];

    if(!fileDir || !fileConfig){
        console.log("Please enter a file directory and file metadata config");
        return;
    }

    let fileList = JSON.parse(fs.readFileSync(fileConfig).toString());
    console.log(JSON.parse(fs.readFileSync(fileConfig).toString()));
    let index = associationIdsByCollection.lastIndexProcessed + 1;
    console.log(index)
    console.log(fileList.length)
    for(let i=index; i<fileList.length; i++) {
        let entry = fileList[i];
        let fileAbsolutePath = findFileAbsolutePath(fileDir, entry["FileName"]);
        console.log(fileAbsolutePath)
        if(fileAbsolutePath){
            console.log(entry["MetaData"]["Title"])
            await processEntry(poolClient, fileAbsolutePath, entry);
            associationIdsByCollection.lastIndexProcessed = i;
            fs.writeFileSync(filePath, JSON.stringify(associationIdsByCollection));
        }
    }

    console.log("Completed file list");
}

function genAssociation(entry: any){
    let collectionName = entry["MetaData"]["Collection"];
    if(associationIdsByCollection[collectionName]){
        associationIdsByCollection[collectionName].sequence = associationIdsByCollection[collectionName].sequence + 1;
    } else {
        let r = Math.floor(Math.random() * 1000000) + 1;
        associationIdsByCollection[collectionName] = {
            id: r,
            sequence: 0
        }
    }
    fs.writeFileSync(filePath, JSON.stringify(associationIdsByCollection));
}

async function processEntry(poolClient: IPoolClient, fileAbsolutePath: string, entry: any) {
    genAssociation(entry);

    let fileTransactionId = await processFile(poolClient, fileAbsolutePath);
    
    let metaData = JSON.stringify(entry["MetaData"]);
    const subTags = [
        { name: TAGS.keys.application, value: TAGS.values.application },
        { name: TAGS.keys.contentType, value: CONTENT_TYPES.json }
    ];

    let metadataTx = poolClient.bundlr.createTransaction(
        metaData,
        { tags: subTags }
    );
    await metadataTx.sign();
    const metadataTxId = metadataTx.id;

    await metadataTx.upload();

    if (!metadataTxId) exitProcess(`Upload Error`, 1);

    let fileJson = {
        fileTxId: fileTransactionId,
        metadataTxId: metadataTxId
    };

    let assocId = associationIdsByCollection[entry["MetaData"]["Collection"]].id;
    let associationSequence = associationIdsByCollection[entry["MetaData"]["Collection"]].sequence;

    let name = entry["MetaData"]["Title"];
    if(!name) {
        name = entry["MetaData"]["Collection"];
    }

    await createAsset(poolClient, {
        index: { path: "file.json" },
        paths: (assetId: string) => ({ "file.json": { id: assetId } }),
        content: fileJson,
        contentType: CONTENT_TYPES.json,
        artifactType: ArtifactEnum.Image,
        name: name,
        description: name,
        type: TAGS.values.ansTypes.image,
        additionalMediaPaths: [],
        profileImagePath: null,
        associationId: assocId.toString(),
        associationSequence: associationSequence.toString(),
        childAssets: null,
        renderWith: null,
        assetId: fileTransactionId,
        fileType: "jpeg"
    });
}

async function processFile(poolClient: IPoolClient, filePath: string) {
    const subTags = [
        { name: TAGS.keys.application, value: TAGS.values.application }
    ];
    let id = await processMediaPath(
        poolClient,
        filePath,
        {
            subTags: subTags,
            tmpdir: null,
            path: filePath,
            keepFile: true
        }
    );
    return id;
}
