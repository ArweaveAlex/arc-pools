import { fstat } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import fs from "fs";

import { ArtifactEnum, IPoolClient } from "../../../helpers/types";
import { 
    checkPath, 
    exitProcess, 
    generateRedditAssetDescription, 
    generateRedditAssetName, 
    log, 
    logValue, 
    processMediaPaths, 
    processMediaURL 
} from "../../../helpers/utils";
import { CONTENT_TYPES, TAGS } from "../../../helpers/config";
import { createAsset } from "../..";
import { shouldUploadContent } from "../moderator";


export async function processPosts(poolClient: IPoolClient, args: {
    posts: any[],
    contentModeration: boolean
}) {
    let parentPosts = args.posts;

    logValue(`Parent Count`, parentPosts.length.toString(), 0);

    let testPosts = [
        // single image in post
        // {data: {id: "10owm4v"}},
        // multi image in post and image comments
        {data: {id: "10nwr7k"}},
        // link in post
        //{data: {id: "10oeksi"}},
        // video in top level post 
        //{Data: {id: "10ohfvf"}}
    ]

    // iterPosts variable just for testing
    // let iterPosts = parentPosts;
    let iterPosts = testPosts;

    for(let i = 0; i< iterPosts.length; i++){
        let url = `/comments/${iterPosts[i].data.id}?depth=50`;
        
        let postWithComments = await poolClient.reddit.get(url);

        // fs.writeFileSync("reddit2.json", JSON.stringify(postWithComments));
        
        const isDup = await poolClient.arClient.isDuplicate({
            artifactName: generateRedditAssetName(postWithComments),
            poolId: poolClient.poolConfig.contracts.pool.id
        });

        // if(!isDup){
            await processPost(
                poolClient, 
                {post: postWithComments, contentModeration: args.contentModeration}
            );
        // } else {
        //     log("Duplicate artifact skipping...", 0);
        // }
    }
}

async function processPost(poolClient: IPoolClient, args: {
    post: any,
    contentModeration: boolean
  }) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });

    let modifiedPost = await processMedia(poolClient, {
        post: args.post,
        tmpdir: tmpdir,
        contentModeration: args.contentModeration
    });

    if (tmpdir) {
        await tmpdir.cleanup()
    }

    const contractId = await createAsset(poolClient, {
        index: { path: "post.json" },
        paths: (assetId: string) => ({ "post.json": { id: assetId } }),
        content: modifiedPost,
        contentType: CONTENT_TYPES.json,
        artifactType: ArtifactEnum.Reddit,
        name: generateRedditAssetName(args.post),
        description: generateRedditAssetDescription(args.post),
        type: TAGS.values.ansTypes.socialPost,
        additionalMediaPaths: [],
        profileImagePath: null,
        associationId: null,
        associationSequence: null,
        childAssets: null,
        assetId: args.post[0].data.id
    });

    if (contractId) {
        return contractId;
    }
}

interface RedditMediaMetadata<T> {
    [index: string]: T
}

// beware the following 2 functions modify
// the object that you pass in
async function processMedia(poolClient: IPoolClient, args: {
  post: any,
  tmpdir: any,
  contentModeration: boolean
}) {
    let modifyPost = args.post;

    const mediaDir = path.join(args.tmpdir.path, "media");
    if (!await checkPath(mediaDir)) {
        await mkdir(mediaDir);
    }

    try {
        let topLevelPost = args.post[0].data;
        if(topLevelPost.children[0].data.media_metadata){
            await processMediaMetadata(
                poolClient, 
                args, 
                topLevelPost.children[0].data.media_metadata,
                mediaDir
            );
        }

        if(topLevelPost.children[1].data){
            console.log(topLevelPost.children[1].data);
        }
    }
    catch (e: any) {
        exitProcess(`Error while archiving media: ${e}`, 1);
    }
    return modifyPost;
}


async function processMediaMetadata(
    poolClient: IPoolClient, 
    args: {
        post: any,
        tmpdir: any,
        contentModeration: boolean
    }, 
    mediaMetaData: RedditMediaMetadata<object>,
    mediaDir: string
) {
    let i = 0;
    for (const [key, _value] of Object.entries(mediaMetaData)) {
        let singleFile: any = mediaMetaData[key];
        let postTopLevelFile = singleFile.s;
        let url = postTopLevelFile.u.replace(/&amp;/g, "&");
        let fileType = singleFile.e;
        if (args.contentModeration) {
            let contentCheckFileType = fileType === "Image" ? "image" : "video";
            let contentCheck = await shouldUploadContent(
                url, 
                contentCheckFileType, 
                poolClient.poolConfig
            );
            if (!contentCheck) {
                return;
            }
        }

        await processMediaURL(url, mediaDir, i);

        const subTags = [
            { name: TAGS.keys.application, value: TAGS.values.application },
            { name: TAGS.keys.redditPostId, value: `${args.post[0].data.id ?? "unknown"}` }
        ]

        let mediaPathsForThisImage = await processMediaPaths(
            poolClient, 
            {subTags: subTags, tmpdir: args.tmpdir, path: "media"}
        );

        let k: string = Object.entries(mediaPathsForThisImage)[0][0];
        let txId = mediaPathsForThisImage[k].id;
        singleFile.s.u = "https://arweave.net/" + txId;
        i++;
    }
}
