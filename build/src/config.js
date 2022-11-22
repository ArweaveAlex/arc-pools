"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAGS = exports.CLI_ARGS = exports.POOL_CONTRACT_PATH = exports.NFT_JSON_PATH = exports.NFT_CONTRACT_PATH = exports.CONTROL_WALLET_PATH = exports.POOLS_PATH = exports.APP_TITLE = void 0;
exports.APP_TITLE = "arc-pools";
exports.POOLS_PATH = "local/testPools.json";
exports.CONTROL_WALLET_PATH = "local/wallets/walletControl.json";
exports.NFT_CONTRACT_PATH = "build/contracts/NFT/contract.js";
exports.NFT_JSON_PATH = "build/contracts/NFT/init.json";
exports.POOL_CONTRACT_PATH = "build/contracts/pool/contract.js";
exports.CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help"
    },
    options: {
        source: "source",
        method: "method",
        mentionTag: "mention-tag"
    },
    sources: {
        twitter: {
            name: "twitter",
            methods: {
                stream: "stream",
                mention: "mention",
                user: "user"
            }
        },
        wikipedia: {
            name: "wikipedia"
        },
    }
};
exports.TAGS = {
    keys: {
        appType: "App-Type",
        poolName: "Pool-Name"
    },
    values: {
        poolv1: "Alex-Archiving-Pool-v1.2"
    }
};
