"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractEndpoint = void 0;
const contractEndpoint = (txId) => `https://gateway.redstone.finance/gateway/contract?txId=${txId}`;
exports.contractEndpoint = contractEndpoint;
