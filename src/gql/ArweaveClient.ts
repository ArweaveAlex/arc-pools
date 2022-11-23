import Arweave from "arweave";
import * as gql from "gql-query-builder";
import { WarpFactory, defaultCacheOptions, SourceImpl } from "warp-contracts";

import { TAGS } from "../config";

const PAGINATOR = 100;

export default class ArweaveClient {
    arweave: any = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 40000,
        logging: false,
    })


    smartweave = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });
    warp = this.smartweave;
    sourceImpl = new SourceImpl(this.arweave);

    async getPoolIds(){
        console.log(`Fetching Pool IDs ...`);
        const aggregatedPools: any = [];
        let cursor: string | null = "";

        const query = (cursor: string) => gql.query({
            operation: "transactions",
            variables: {
                tags: {
                    value: {
                        name: TAGS.keys.appType,
                        values: [TAGS.values.poolv1]
                    },
                    type: "[TagFilter!]"
                },
                first: PAGINATOR,
                after: cursor
            },
            fields: [
                {
                    edges: [
                        "cursor",
                        {
                            node: [
                                "id"
                            ]
                        }
                    ]
                }
            ]
        })
        
        while (cursor !== null) {
            const response: any = await this.arweave.api.post("/graphql", query(cursor));
            if (response.data.data) {
                const responseData = response.data.data.transactions.edges;
                if (responseData.length > 0) {
                    cursor = responseData[responseData.length - 1].cursor;
                    aggregatedPools.push(...responseData);
                    if (responseData.length < PAGINATOR) {
                        cursor = null;
                    }
                }
                else {
                    cursor = null;
                }
            }
            else {
                cursor = null;
            }
        }

        return aggregatedPools.map((element: any) => { // TODO - any -> PoolQueryType
            return element.node.id;
        });
    }

    async getAllPools() {
        console.log(`Fetching Pools ...`);
        const collections: any = [];
        const POOL_IDS = await this.getPoolIds();
        for (let i = 0; i < POOL_IDS.length; i++) {
            try {
                const contract = this.smartweave.contract(POOL_IDS[i]!);
                contract.setEvaluationOptions({
                    allowBigInt: true
                });
                collections.push({ id: POOL_IDS[i], state: (await contract.readState()).cachedValue.state });
            }
            catch (error: any) {
                console.error(error)
            }
        }

        return collections;
    }
}