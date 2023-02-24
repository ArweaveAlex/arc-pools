import Arweave from "arweave";
import { WarpFactory, defaultCacheOptions } from "warp-contracts";

import { GQLResponseType } from "../../helpers/types";
import { getGQLData } from "../../gql";

import { TAGS } from "../../helpers/config";

const GET_ENDPOINT = "arweave.net";
const POST_ENDPOINT = "arweave.net";

const PORT = 443;
const PROTOCOL = "https";
const TIMEOUT = 40000;
const LOGGING = false;

export default class ArweaveClient {
    arweaveGet: any = Arweave.init({
        host: GET_ENDPOINT,
        port: PORT,
        protocol: PROTOCOL,
        timeout: TIMEOUT,
        logging: LOGGING
    });

    arweavePost: any = Arweave.init({
        host: POST_ENDPOINT,
        port: PORT,
        protocol: PROTOCOL,
        timeout: TIMEOUT,
        logging: LOGGING
    });

    warp: any = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });

    async isDuplicate(args: {
        artifactName: string,
        poolId: string,
    }) {
        const artifacts: GQLResponseType[] = await getGQLData({
            ids: null,
            tagFilters: [
                {
                    name: TAGS.keys.artifactName,
                    values: [args.artifactName]
                },
                {
                    name: TAGS.keys.poolId,
                    values: [args.poolId]
                }
            ],
            uploader: null,
            cursor: null
        });
        return artifacts.length > 0;
    }
}