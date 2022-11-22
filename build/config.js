"use strict";
exports.__esModule = true;
exports.TAGS = exports.CLI_ARGS = exports.POOL_CONTRACT_PATH = exports.NFT_JSON_PATH = exports.NFT_CONTRACT_PATH = exports.CONTROL_WALLET_PATH = exports.POOLS_PATH = exports.APP_TITLE = void 0;
exports.APP_TITLE = "arc-pools";
exports.POOLS_PATH = "local/test-pools.json";
exports.CONTROL_WALLET_PATH = "local/wallets/control-wallet.json";
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
        source: {
            name: "source"
        }
    },
    sources: {
        twitter: {
            name: "twitter"
        },
        wikipedia: {
            name: "wikipedia"
        }
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
