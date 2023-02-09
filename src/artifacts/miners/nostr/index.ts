import { generatePrivateKey, getPublicKey } from 'nostr-tools';
import tmp from "tmp-promise";
import { mkdir } from "fs/promises";
import path from "path";

import { CONTENT_TYPES, DEFAULT_NOSTR_RELAYS, TAGS } from '../../../helpers/config';
import { ArtifactEnum, IPoolClient } from '../../../helpers/types';
import { generateNostrAssetDescription, generateNostrAssetName, log, saveConfig } from '../../../helpers/utils';
import { 
    checkPath, 
    uploadFile,
    sha256Object
} from "../../../helpers/utils";

import { createAsset } from "../..";

export async function genKeys(poolClient: IPoolClient, poolLabel: string) {
    let nostrConfig = poolClient.poolConfig.nostr;
    if(nostrConfig && nostrConfig.keys){
        if(nostrConfig.keys.public && nostrConfig.keys.private){
            if((nostrConfig.keys.public !== "") && (nostrConfig.keys.private !== "")){
                return;
            }
        }
    }

    let sk = generatePrivateKey();
    let pk = getPublicKey(sk);

    nostrConfig = {
        keys: {
            public: pk.toString(),
            private: sk.toString() 
        },
        relays: DEFAULT_NOSTR_RELAYS
    };

    poolClient.poolConfig.nostr = nostrConfig;

    saveConfig(poolClient.poolConfig, poolLabel);
}

export async function processEvent(poolClient: IPoolClient, args: {
    event: any,
    contentModeration: boolean
  }) {
    console.log(args.event);
    const isDup = await poolClient.arClient.isDuplicate({
        artifactName: generateNostrAssetName(args.event),
        poolId: poolClient.poolConfig.contracts.pool.id
    });

    if(isDup){
        log("Duplicate artifact skipping...", 0);
        return;
    } 
    
    const tmpdir = await tmp.dir({ unsafeCleanup: true });

    await processMedia(poolClient, {
        event: args.event,
        tmpdir: tmpdir,
        contentModeration: args.contentModeration
    });

    const contractId = await createAsset(poolClient, {
        index: { path: "event.json" },
        paths: (assetId: string) => ({ "event.json": { id: assetId } }),
        content: args.event,
        contentType: CONTENT_TYPES.json,
        artifactType: ArtifactEnum.Nostr,
        name: generateNostrAssetName(args.event),
        description: generateNostrAssetDescription(args.event),
        type: TAGS.values.ansTypes.socialPost,
        additionalMediaPaths: [],
        profileImagePath: null,
        associationId: null,
        associationSequence: null,
        childAssets: null,
        assetId: sha256Object(args.event.post),
        renderWith: null
    });

    if (contractId) {
        return contractId;
    }
}

async function processMedia(poolClient: IPoolClient, args: {
    event: any,
    contentModeration: boolean,
    tmpdir: any
}) {
    const mediaDir = path.join(args.tmpdir.path, "media");
    if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir);
    }
    args.event.post.tags.map(async (tag: string[]) => {
        if(tag.includes('resource')) {
            console.log(tag);
            if(tag[2].includes("mpeg")) {console.log("Skipping audio file"); return;}
            if (!await checkPath(mediaDir)) {
                await mkdir(mediaDir);
            }
            let url = tag[1];

            let nostrEventId = sha256Object(args.event);

            const subTags = [
                { name: TAGS.keys.application, value: TAGS.values.application },
                { name: TAGS.keys.nostrEventId, value: `${nostrEventId ?? "unknown"}` }
            ]

            let txId = await uploadFile (
                poolClient,
                mediaDir, 
                url, 
                {...{tags: subTags}, ...args}
            );

            if(txId) {
                tag[1] = "https://arweave.net/" + txId;
                console.log("https://arweave.net/" + txId);
            };
        }
    });
}