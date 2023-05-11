"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSearch = exports.initSearch = void 0;
const gql_1 = require("../gql");
const helpers_1 = require("../helpers");
let processedIndeces = 0;
let poolIndecesLength = 0;
function stripSearch(s) {
    return s
        .replaceAll(' ', '')
        .replaceAll('\t', '')
        .replaceAll('\r', '')
        .replaceAll('\n', '')
        .replaceAll(helpers_1.SEARCH.idTerm, '')
        .replaceAll(helpers_1.SEARCH.ownerTerm, '')
        .toLowerCase();
}
async function initSearch(poolIds) {
    try {
        if (poolIds) {
            let poolIndeces = [];
            for (let i = 0; i < poolIds.length; i++) {
                let latestIndexTransaction = await (0, gql_1.getLatestPoolSearchIndexTxId)(poolIds[i]);
                if (!latestIndexTransaction)
                    continue;
                let latestIndexTransactionId = (0, helpers_1.getTagValue)(latestIndexTransaction.node.tags, helpers_1.TAGS.keys.uploaderTxId);
                let poolSearchState = (await (0, gql_1.getPoolSearchIndexById)(latestIndexTransactionId)).state;
                if (!poolSearchState || !poolSearchState.searchIndeces) {
                    continue;
                }
                let thisPoolIndeces = poolSearchState.searchIndeces.map((index) => {
                    return (0, helpers_1.getTxEndpoint)(index);
                });
                poolIndeces = poolIndeces.concat(thisPoolIndeces);
            }
            return poolIndeces;
        }
    }
    catch (e) {
        console.error(e);
        return null;
    }
    return null;
}
exports.initSearch = initSearch;
async function runSearch(searchTerm, poolIndeces, owner, callback) {
    processedIndeces = 0;
    poolIndecesLength = poolIndeces.length;
    if (poolIndeces) {
        for (let k = 0; k < poolIndeces.length; k++) {
            let poolIndex = poolIndeces[k];
            searchIndex(searchTerm, poolIndex, owner, callback);
        }
    }
}
exports.runSearch = runSearch;
async function searchIndex(searchTerm, index, owner, callback) {
    const searchIndex = (await fetch(index)).data;
    let text = searchIndex;
    searchTerm = stripSearch(searchTerm);
    let indeces = [...text.matchAll(new RegExp(searchTerm, 'gi'))].map((a) => a.index);
    let ids = [];
    for (let i = 0; i < indeces.length; i++) {
        let idString = pullId(indeces[i], text, helpers_1.SEARCH.idTerm);
        if (owner) {
            let ownerIdString = pullId(indeces[i], text, helpers_1.SEARCH.ownerTerm);
            if (ownerIdString === owner) {
                ids.push(idString);
            }
        }
        else {
            ids.push(idString);
        }
    }
    processedIndeces++;
    callback(ids, allIndecesProcessed());
}
function allIndecesProcessed() {
    if (processedIndeces === poolIndecesLength)
        return true;
    return false;
}
function pullId(index, text, splitTerm) {
    for (let j = index; j < text.length; j++) {
        let backTrack = j - (splitTerm.length - 1);
        let subTerm = text.substring(backTrack, j + 1);
        if (subTerm === splitTerm) {
            for (let k = j + 1; k < text.length; k++) {
                let backTrack2 = k - (splitTerm.length - 1);
                let subTerm2 = text.substring(backTrack2, k + 1);
                if (subTerm2 === splitTerm) {
                    return text.substring(j + 1, k - 1);
                }
            }
        }
    }
    return null;
}
