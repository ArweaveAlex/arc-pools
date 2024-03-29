import { mkdir } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { ArtifactEnum, CONTENT_TYPES, IPoolClient, RENDER_WITH_VALUE, TAGS } from 'arcframework';

import { createAsset } from '../../api';
import {
    checkPath,
    generateNostrAssetDescription, generateNostrAssetName, log,
    sha256Object,
    uploadFile
} from '../../helpers/utils';


export async function processEvent(poolClient: IPoolClient, args: {
    event: any,
    associationId: string,
    associationSequence: string,
    contentModeration: boolean
}) {
    const isDup = await poolClient.arClient.isDuplicate({
        artifactName: generateNostrAssetName(args.event),
        poolId: poolClient.poolConfig.contracts.pool.id
    });

    if (isDup) {
        log("Skipping duplicate artifact...", 0);
        await new Promise((r) => setTimeout(r, 500));
        return;
    }

    const tmpdir = await tmp.dir({ unsafeCleanup: true });

    let profileImage = await processProfileImage(poolClient, {
        event: args.event,
        tmpdir: tmpdir,
        contentModeration: args.contentModeration
    });

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
        profileImagePath: profileImage,
        associationId: args.associationId,
        associationSequence: args.associationSequence,
        childAssets: null,
        assetId: sha256Object(args.event.post),
        renderWith: RENDER_WITH_VALUE
    });

    if (contractId) {
        return contractId;
    }
}

async function processProfileImage(poolClient: IPoolClient, args: {
    event: any,
    contentModeration: boolean,
    tmpdir: any
}) {
    if (!args.event.profile) return null;
    if (args.event.profile.picture) {
        let r = Math.floor(Math.random() * (100000000 - 0 + 1)) + 0;
        const profileDir = path.join(args.tmpdir.path, "profile-" + r);
        console.log(profileDir)

        if (!await checkPath(profileDir)) {
            await mkdir(profileDir);
        }

        let arweaveUrl = await processImage(poolClient, {
            event: args.event,
            contentModeration: args.contentModeration,
            mediaDir: profileDir,
            url: args.event.profile.picture
        });

        if (arweaveUrl) args.event.profile.picture = arweaveUrl;

        console.log(args.event.profile.picture);

        return arweaveUrl;
    }

    return null;
}

async function processMedia(poolClient: IPoolClient, args: {
    event: any,
    contentModeration: boolean,
    tmpdir: any
}) {
    let r = Math.floor(Math.random() * (100000000 - 0 + 1)) + 0;
    const mediaDir = path.join(args.tmpdir.path, "media-" + r);
    if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir);
    }
    args.event.post.tags.map(async (tag: string[]) => {
        if (tag.includes('resource')) {
            console.log(tag);
            if (tag[2].includes("mpeg")) { console.log("Skipping audio file"); return; }

            let arweaveUrl = await processImage(poolClient, {
                event: args.event,
                contentModeration: args.contentModeration,
                mediaDir: mediaDir,
                url: tag[1]
            });

            if (arweaveUrl) tag[1] = arweaveUrl;
        }
    });
}

async function processImage(poolClient: IPoolClient, args: {
    event: any,
    contentModeration: boolean,
    mediaDir: any,
    url: any
}) {
    if (!await checkPath(args.mediaDir)) {
        await mkdir(args.mediaDir);
    }

    let nostrEventId = sha256Object(args.event.post);

    const subTags = [
        { name: TAGS.keys.application, value: TAGS.values.application },
        { name: TAGS.keys.nostrEventId, value: `${nostrEventId ?? "unknown"}` }
    ]

    let txId = await uploadFile(
        poolClient,
        args.mediaDir,
        args.url,
        { tags: subTags, tmpdir: args.mediaDir }
    );

    if (txId) {
        return "https://arweave.net/" + txId;
    };

    return null;
}