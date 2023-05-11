"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sonarLink = exports.getRendererEndpoint = exports.getRedstoneDescEndpoint = exports.getRedstoneSrcTxEndpoint = exports.getTxEndpoint = exports.getViewblockEndpoint = exports.getBalanceEndpoint = void 0;
function getBalanceEndpoint(wallet) {
    return `https://arweave.net/wallet/${wallet}/balance`;
}
exports.getBalanceEndpoint = getBalanceEndpoint;
function getViewblockEndpoint(txId) {
    return `https://v2.viewblock.io/arweave/tx/${txId}`;
}
exports.getViewblockEndpoint = getViewblockEndpoint;
function getTxEndpoint(txId) {
    return `https://arweave.net/${txId}`;
}
exports.getTxEndpoint = getTxEndpoint;
function getRedstoneSrcTxEndpoint(contractId, page) {
    return `https://gateway.redstone.finance/gateway/contracts-by-source?id=${contractId}&limit=15&page=${page.toString()}`;
}
exports.getRedstoneSrcTxEndpoint = getRedstoneSrcTxEndpoint;
function getRedstoneDescEndpoint(src, page, limit) {
    return `https://gateway.redstone.finance/gateway/contracts-by-source?id=${src}&page=${page.toString()}&sort=desc&limit=${limit.toString()}`;
}
exports.getRedstoneDescEndpoint = getRedstoneDescEndpoint;
function getRendererEndpoint(renderWith, tx) {
    return `https://${renderWith}.arweave.dev/?tx=${tx}`;
}
exports.getRendererEndpoint = getRendererEndpoint;
const sonarLink = (contractId) => `https://sonar.warp.cc/#/app/contract/${contractId}`;
exports.sonarLink = sonarLink;
