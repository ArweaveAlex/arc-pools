const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

import { PoolConfigType } from "arcframework";

import { MODERATION_THRESHOLDS } from "../helpers/config";
import { log } from "../helpers/utils";

const stub = ClarifaiStub.grpc();
let poolConfig: PoolConfigType;

export async function shouldUploadContent(
    url: string, 
    type: string,
    config: PoolConfigType
) {
    poolConfig = config;
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let res: any = await asyncWrapper(
            url, 
            type
        );
        if(type === "image") {
            for (const c of res.outputs[0].data.concepts) {
                if(c.name === "explicit") {
                    if(c.value > MODERATION_THRESHOLDS["explicit"]) {
                        return false;
                    }
                }
                if(c.name === "suggestive") {
                    if(c.value > MODERATION_THRESHOLDS["suggestive"]) {
                        return false;
                    }
                }
            }
        } else if (type === "video") {
            for (const frame of res.outputs[0].data.frames) {
                for (const c of  frame.data.concepts) {
                    if (c.name === "explicit") {
                        if(c.value > MODERATION_THRESHOLDS["explicit"]) {
                            return false;
                        }
                    }

                    if(c.name === "suggestive") {
                        if( c.value > MODERATION_THRESHOLDS["suggestive"]) {
                            return false;
                        }
                    }
                }
            }
        }
    } catch (e: any){
        log(`Moderation failed...\n${e}`, 1)
        return false;
    }

    return true;
}

function asyncWrapper(url: string, type: string) {
    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + poolConfig.clarifaiApiKey);
    
    let data = null;

    if(type === 'image') {
        data = {data: {image: {url: url}}};
    } else if (type === 'video') {
        data = {data: {video: {url: url}}};
    } else if (type === 'animated_gif') {
        data = {data: {image: {url: url}}};
    }

    return new Promise((resolve, reject) => {
        stub.PostModelOutputs({
            model_id: "moderation-recognition",
            inputs: [data]
        }, 
        metadata, 
        (err: any, response: any) => {
            if (err !== null) reject(err);
            else if (response.status.code !== 10000) reject(response)
            else resolve(response);
        });
    })
}