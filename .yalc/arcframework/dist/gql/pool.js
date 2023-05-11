"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolCount = exports.getPoolSearchIndexById = exports.getLatestPoolSearchIndexTxId = exports.getPoolById = void 0;
const clients_1 = require("../clients");
const config_1 = require("../helpers/config");
const endpoints_1 = require("../helpers/endpoints");
const utils_1 = require("../helpers/utils");
const _1 = require(".");
async function getPoolById(poolId) {
    const arClient = new clients_1.ArweaveClient();
    try {
        const contract = arClient.warp.contract(poolId).setEvaluationOptions({
            allowBigInt: true,
        });
        return {
            id: poolId,
            state: (await contract.readState()).cachedValue.state,
        };
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.getPoolById = getPoolById;
async function getLatestPoolSearchIndexTxId(poolId) {
    const poolSearchIndeces = await (0, _1.getGQLData)({
        ids: null,
        tagFilters: [
            {
                name: config_1.TAGS.keys.appType,
                values: [config_1.TAGS.values.searchIndex],
            },
            {
                name: config_1.TAGS.keys.alexPoolId,
                values: [poolId],
            },
        ],
        uploader: null,
        cursor: null,
        reduxCursor: null,
        cursorObject: null,
    });
    if (poolSearchIndeces.data.length === 0)
        return null;
    if (poolSearchIndeces.data.length === 1)
        return poolSearchIndeces.data[0];
    let latestIndex = poolSearchIndeces.data[0];
    for (let i = 1; i < poolSearchIndeces.data.length; i++) {
        let thisIndex = poolSearchIndeces.data[i];
        let thisIndexDateTag = (0, utils_1.getTagValue)(thisIndex.node.tags, config_1.TAGS.keys.timestamp);
        let latestIndexDateTag = (0, utils_1.getTagValue)(latestIndex.node.tags, config_1.TAGS.keys.timestamp);
        let thisIndexDate = thisIndexDateTag && thisIndexDateTag !== config_1.STORAGE.none ? parseInt(thisIndexDateTag) : 0;
        let latestIndexDate = latestIndexDateTag && latestIndexDateTag !== config_1.STORAGE.none ? parseInt(latestIndexDateTag) : 0;
        if (thisIndexDate > latestIndexDate) {
            latestIndex = thisIndex;
        }
    }
    return latestIndex;
}
exports.getLatestPoolSearchIndexTxId = getLatestPoolSearchIndexTxId;
async function getPoolSearchIndexById(poolSearchIndexId) {
    const arClient = new clients_1.ArweaveClient();
    try {
        const contract = arClient.warp.contract(poolSearchIndexId).setEvaluationOptions({
            allowBigInt: true,
        });
        return {
            id: poolSearchIndexId,
            state: (await contract.readState()).cachedValue.state,
        };
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.getPoolSearchIndexById = getPoolSearchIndexById;
async function getPoolCount(nftContractSrc) {
    let redstoneContracts = await fetch((0, endpoints_1.getRedstoneSrcTxEndpoint)(nftContractSrc, 1));
    let redstoneJson = await redstoneContracts.json();
    return parseInt(redstoneJson.paging.total) - 1;
}
exports.getPoolCount = getPoolCount;
