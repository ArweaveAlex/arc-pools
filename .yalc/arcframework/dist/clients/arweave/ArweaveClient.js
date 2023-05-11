"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("@bundlr-network/client"));
const arweave_1 = __importDefault(require("arweave"));
const warp_contracts_1 = require("warp-contracts");
const warp_contracts_plugin_deploy_1 = require("warp-contracts-plugin-deploy");
const helpers_1 = require("../../helpers");
const gql_1 = require("../../gql");
warp_contracts_1.LoggerFactory.INST.logLevel('fatal');
const GET_ENDPOINT = 'arweave-search.goldsky.com';
const POST_ENDPOINT = 'arweave.net';
const PORT = 443;
const PROTOCOL = 'https';
const TIMEOUT = 40000;
const LOGGING = true;
const BUNDLR_NODE = 'https://node2.bundlr.network';
const CURRENCY = 'arweave';
class ArweaveClient {
    constructor(bundlrJwk) {
        let bundlr;
        if (bundlrJwk) {
            bundlr = new client_1.default(BUNDLR_NODE, CURRENCY, bundlrJwk);
        }
        this.bundlr = bundlr;
        this.arweaveGet = arweave_1.default.init({
            host: GET_ENDPOINT,
            port: PORT,
            protocol: PROTOCOL,
            timeout: TIMEOUT,
            logging: LOGGING,
        });
        this.arweavePost = arweave_1.default.init({
            host: POST_ENDPOINT,
            port: PORT,
            protocol: PROTOCOL,
            timeout: TIMEOUT,
            logging: LOGGING,
        });
        this.warp = warp_contracts_1.WarpFactory.forMainnet({
            ...warp_contracts_1.defaultCacheOptions,
            inMemory: true
        }).use(new warp_contracts_plugin_deploy_1.DeployPlugin());
    }
    async isDuplicate(args) {
        const artifacts = await (0, gql_1.getGQLData)({
            ids: null,
            tagFilters: [
                {
                    name: helpers_1.TAGS.keys.artifactName,
                    values: [args.artifactName]
                },
                {
                    name: helpers_1.TAGS.keys.poolId,
                    values: [args.poolId]
                }
            ],
            uploader: null,
            cursor: null,
            reduxCursor: null,
            cursorObject: null
        });
        return artifacts.data.length > 0;
    }
}
exports.default = ArweaveClient;
