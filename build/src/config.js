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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAGS = exports.CLI_ARGS = exports.POOL_CONTRACT_PATH = exports.NFT_JSON_PATH = exports.NFT_CONTRACT_PATH = exports.CONTROL_WALLET_PATH = exports.POOLS_PATH = exports.APP_TITLE = void 0;
const path = __importStar(require("path"));
exports.APP_TITLE = "arc-pools";
const baseDir = path.join(__dirname, '../local');
exports.POOLS_PATH = "local/testPools.json";
exports.CONTROL_WALLET_PATH = "local/wallets/walletControl.json";
exports.NFT_CONTRACT_PATH = "src/contracts/NFT/contract.ts";
exports.NFT_JSON_PATH = "src/contracts/NFT/init.json";
exports.POOL_CONTRACT_PATH = "src/contracts/pool/contract.ts";
exports.CLI_ARGS = {
    commands: {
        create: "create",
        mine: "mine",
        help: "help"
    },
    options: {
        source: "source",
        method: "method",
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
//# sourceMappingURL=config.js.map