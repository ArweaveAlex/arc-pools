import minimist from "minimist";
import * as fs from "fs";
import * as pathI from 'path';

import { PoolClient, ArtifactEnum, PoolConfigType } from "arcframework";

import { 
    exitProcess, 
    log, 
    processMediaPath,
    walk
} from "../../../helpers/utils";
import { CONTENT_TYPES, ARTIFACT_TYPES_BY_FILE, TAGS, RENDER_WITH_VALUE } from "../../../helpers/config";
import { createAsset } from "../..";

const sentFilesFilename = 'sentFiles.json';
let sentFiles = [];
let sentFilesFilepath = null;

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
    const poolClient = new PoolClient(poolConfig);
  
    if (!poolConfig.walletKey) {
      exitProcess(`Invalid Pool Wallet Configuration`, 1);
    }

    console.log("Mining files");

    const path = argv["path"];
    const metaFile = argv["meta-file"];
    const clear = argv["clear"];

    if(!path){
        log("Please provide a --path", 1);
        return;
    }

    let metaConfig = null;

    // if they send a meta-file option parse it to config
    if(metaFile){
        if (!fs.existsSync(metaFile) || !fs.statSync(metaFile).isFile()) {
            exitProcess('meta-file not found or is not a file.', 1);
        }
        try {
            const metaFileData = fs.readFileSync(metaFile, 'utf-8');
            metaConfig = JSON.parse(metaFileData);  
        } catch(e: any) {
            log(e, 1);
            exitProcess('Failed to parse metadata config.', 1)
        }
    }

    if (fs.existsSync(path)) {
        if(fs.statSync(path).isFile()){
            log('Archiving file', 0);
            await archiveFile(poolClient, metaConfig, path, null);
        } else if (fs.statSync(path).isDirectory()){
            log('Archiving directory', 0);
            genSentFiles(path, clear);
            await archiveDirectory(poolClient, metaConfig, path);
        } else {
            exitProcess('path is not a file or directory.', 1);
        }
      } else {
        exitProcess('path not found.', 1);
      }
    
    log("Completed file list", 0);
}

function genSentFiles(path: string, clear: boolean) {
    sentFilesFilepath = pathI.join(path, sentFilesFilename);
    if(clear) {
        fs.rmSync(sentFilesFilepath);
    }
    if (fs.existsSync(sentFilesFilepath) && fs.statSync(sentFilesFilepath).isFile()) {
        const fileData = fs.readFileSync(sentFilesFilepath, 'utf-8');
        sentFiles = JSON.parse(fileData);
    } else {
        fs.writeFileSync(sentFilesFilepath, "[]");
    }
}

function findFileConfig(fileName: string, metaConfig: any) {
    if(metaConfig){
        return metaConfig.find((obj: any) => obj["FileName"] === fileName); 
    } else {
        return null;
    }
}

async function archiveDirectory(poolClient: PoolClient, metaConfig: any, path: string) {
    for await (const f of walk(path)) {
        if (pathI.basename(f) !== sentFilesFilename) {
            if(!sentFiles.includes(pathI.basename(f))) {
                await archiveFile(poolClient, metaConfig, f, path);
            } else {
                log(
                    `Skipping ${pathI.basename(f)}, 
                    file already sent to this pool, run with --clear option to resend all files from this directory`, 
                    0
                );
            }
        }
    }
}

async function archiveFile(poolClient: PoolClient, metaConfig: any, path: string, dir: string | null) {
    let fileName = pathI.basename(path);
    let fileConfig = findFileConfig(fileName, metaConfig);

    let name = fileConfig && fileConfig["ArtifactName"] ? fileConfig["ArtifactName"] : fileName;
    let metaData = fileConfig && fileConfig["MetaData"] ? JSON.stringify(fileConfig["MetaData"]) : JSON.stringify({});
    let fileType = pathI.extname(path).slice(1);
    let grouped = fileConfig && fileConfig["ArtifactGroup"] && fileConfig["ArtifactGroupSequence"];
    let associationId = grouped ? fileConfig["ArtifactGroup"] : null;
    let associationSequence = associationId ? fileConfig["ArtifactGroupSequence"] : null;

    const subTags = [
        { name: TAGS.keys.application, value: TAGS.values.application },
        { name: TAGS.keys.contentType, value: CONTENT_TYPES.json }
    ];

    let fileTransactionId = await processFile(poolClient, path);

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

    let ansType: string;
    let alexType = ARTIFACT_TYPES_BY_FILE[fileType] ? ARTIFACT_TYPES_BY_FILE[fileType] : ArtifactEnum.File;
    switch (alexType){
        case ArtifactEnum.Video:
            ansType = TAGS.values.ansTypes.video;
            break;
        case ArtifactEnum.Audio:
            ansType = TAGS.values.ansTypes.music;
            break;
        case ArtifactEnum.Image:
            ansType = TAGS.values.ansTypes.image;
            break;
        case ArtifactEnum.Document:
            ansType = TAGS.values.ansTypes.document;
            break;
        case ArtifactEnum.Ebook:
            ansType = TAGS.values.ansTypes.document;
            break;
        // file is a default
        case ArtifactEnum.File:
            ansType = TAGS.values.ansTypes.file;
            break;
    }

    let asset = await createAsset(poolClient, {
        index: { path: "file.json" },
        paths: (assetId: string) => ({ "file.json": { id: assetId } }),
        content: fileJson,
        contentType: CONTENT_TYPES.json,
        artifactType: alexType,
        name: name,
        description: name,
        type: ansType,
        additionalMediaPaths: [],
        profileImagePath: null,
        associationId: associationId,
        associationSequence: associationSequence,
        childAssets: null,
        renderWith: RENDER_WITH_VALUE,
        assetId: fileTransactionId,
        fileType: fileType
    });

    if(asset) {
        if(dir) {
            sentFiles.push(fileName);
            fs.writeFileSync(sentFilesFilepath, JSON.stringify(sentFiles));
        }
    }
}

async function processFile(poolClient: PoolClient, filePath: string) {
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