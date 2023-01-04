import { ArweaveClient } from "../arweave-client";
import { unquoteJsonKeys } from "../utils";
import { PAGINATOR } from "../config";
import { GQLResponseType, TagFilterType } from "../types";

export async function getGQLData(args: {
    ids: string[] | null;
    tagFilters: TagFilterType[] | null,
    uploader: string | null,
    cursor: string | null,
    reduxCursor: string | null
}): Promise<GQLResponseType[]> {

    const arClient = new ArweaveClient();
    const data: GQLResponseType[] = [];

    if (args.ids && args.ids.length <= 0) {
        return data;
    }

    const ids = args.ids ? JSON.stringify(args.ids) : null;
    const tags = args.tagFilters ? unquoteJsonKeys(args.tagFilters) : null;
    const owners = args.uploader ? JSON.stringify([args.uploader]) : null;

    const cursor = args.cursor ? `"${args.cursor}"` : null;

    const operation = {
        query: `
            query {
                    transactions(
                        ids: ${ids},
                        tags: ${tags},
                        owners: ${owners},
                        first: ${PAGINATOR}, 
                        after: ${cursor}
                    ){
                    edges {
                        cursor
                        node {
                            id
                            tags {
                                name 
                                value 
                            }
                            data {
                                size
                                type
                            }
                        }
                    }
                }
            }
            `
    }

    const response = await arClient.arweaveGet.api.post("/graphql", operation);
    if (response.data.data) {
        const responseData = response.data.data.transactions.edges;
        if (responseData.length > 0) {
            data.push(...responseData);
        }
    }

    return data;
}