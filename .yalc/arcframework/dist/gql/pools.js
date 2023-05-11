"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolIds = exports.getPools = void 0;
const clients_1 = require("../clients");
const config_1 = require("../helpers/config");
async function getPools() {
    const arClient = new clients_1.ArweaveClient();
    const contract = arClient.warp.contract(config_1.POOL_INDEX_CONTRACT_ID).setEvaluationOptions({
        allowBigInt: true,
        remoteStateSyncEnabled: true,
    });
    return (await contract.readState()).cachedValue.state.pools;
}
exports.getPools = getPools;
async function getPoolIds() {
    return (await getPools()).map((pool) => pool.id);
}
exports.getPoolIds = getPoolIds;
