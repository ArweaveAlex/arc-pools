"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arweave_1 = __importDefault(require("arweave"));
const gql = __importStar(require("gql-query-builder"));
const warp_contracts_1 = require("warp-contracts");
const config_1 = require("../config");
const PAGINATOR = 100;
class ArweaveClient {
    constructor() {
        this.arweave = arweave_1.default.init({
            host: "arweave.net",
            port: 443,
            protocol: "https",
            timeout: 40000,
            logging: false,
        });
        this.smartweave = warp_contracts_1.WarpNodeFactory.memCachedBased(this.arweave).useArweaveGateway().build();
        this.warp = warp_contracts_1.WarpNodeFactory.memCached(this.arweave);
        this.sourceImpl = new warp_contracts_1.SourceImpl(this.arweave);
    }
    async getPoolIds() {
        console.log(`Fetching Pool IDs ...`);
        const aggregatedPools = [];
        let cursor = "";
        const query = (cursor) => gql.query({
            operation: "transactions",
            variables: {
                tags: {
                    value: {
                        name: config_1.TAGS.keys.appType,
                        values: [config_1.TAGS.values.poolv1]
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
        });
        while (cursor !== null) {
            const response = await this.arweave.api.post("/graphql", query(cursor));
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
        return aggregatedPools.map((element) => {
            return element.node.id;
        });
    }
    async getAllPools() {
        console.log(`Fetching Pools ...`);
        const collections = [];
        const POOL_IDS = await this.getPoolIds();
        for (let i = 0; i < POOL_IDS.length; i++) {
            try {
                const contract = this.smartweave.contract(POOL_IDS[i]);
                collections.push({ id: POOL_IDS[i], state: (await contract.readState()).state });
            }
            catch (error) {
                console.error(error);
            }
        }
        return collections;
    }
}
exports.default = ArweaveClient;
//# sourceMappingURL=ArweaveClient.js.map