"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const cli_color_1 = __importDefault(require("cli-color"));
const gql_1 = require("../gql");
const utils_1 = require("../utils");
const validations_1 = require("../validations");
const endpoints_1 = require("../endpoints");
const config_1 = require("../config");
const command = {
    name: config_1.CLI_ARGS.commands.create,
    execute: async (args) => {
        const poolConfig = (0, validations_1.validatePoolConfig)(args);
        const POOLS_JSON = JSON.parse(fs_1.default.readFileSync(config_1.POOLS_PATH).toString());
        const poolArg = args.commandValues[0];
        const arClient = new gql_1.ArweaveClient();
        const exisitingPools = await arClient.getAllPools();
        exisitingPools.forEach(function (pool) {
            if (poolConfig.state.title === pool.state.title) {
                (0, utils_1.exitProcess)(`Pool Already Exists`, 1);
            }
        });
        let controlWallet;
        let nftSrc;
        let nftInitState;
        let poolSrc;
        try {
            controlWallet = JSON.parse(fs_1.default.readFileSync(config_1.CONTROL_WALLET_PATH).toString());
            nftSrc = fs_1.default.readFileSync(config_1.NFT_CONTRACT_PATH, "utf8");
            nftInitState = JSON.parse(fs_1.default.readFileSync(config_1.NFT_JSON_PATH, "utf8"));
            poolSrc = fs_1.default.readFileSync(config_1.POOL_CONTRACT_PATH, "utf8");
        }
        catch {
            (0, utils_1.exitProcess)(`Invalid Control Wallet / Contract Configuration`, 1);
        }
        console.log(`Deploying NFT Contract Source ...`);
        const nftDeployment = await arClient.warp.createContract.deploy({
            src: nftSrc,
            initState: JSON.stringify(nftInitState),
            wallet: controlWallet
        }, true);
        const nftDeploymentSrc = (await axios_1.default.get((0, endpoints_1.contractEndpoint)(nftDeployment))).data.srcTxId;
        POOLS_JSON[poolArg].contracts.nft.id = nftDeployment;
        POOLS_JSON[poolArg].contracts.nft.src = nftDeploymentSrc;
        fs_1.default.writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.id - [`, cli_color_1.default.green(`'${nftDeployment}'`), `]`);
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.nft.src - [`, cli_color_1.default.green(`'${nftDeploymentSrc}'`), `]`);
        console.log(`Deploying Pool Contract Source ...`);
        const poolSrcDeployment = await arClient.sourceImpl.save({ src: poolSrc }, controlWallet);
        POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.id;
        fs_1.default.writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.src - [`, cli_color_1.default.green(`'${poolSrcDeployment.id}'`), `]`);
        const timestamp = Date.now().toString();
        POOLS_JSON[poolArg].state.timestamp = timestamp;
        fs_1.default.writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - state.timestamp - `, cli_color_1.default.green(`'${timestamp}'`));
        const poolInitJson = {
            title: poolConfig.state.title,
            image: poolConfig.state.image,
            briefDescription: poolConfig.state.briefDescription,
            description: poolConfig.state.description,
            link: poolConfig.state.image,
            owner: poolConfig.state.owner.pubkey,
            ownerInfo: poolConfig.state.owner.info,
            timestamp: timestamp,
            contributors: {},
            tokens: {},
            totalContributions: "0",
            totalSupply: "0"
        };
        const tags = [
            { "name": config_1.TAGS.keys.appType, "value": poolConfig.appType },
            { "name": config_1.TAGS.keys.poolName, "value": poolConfig.state.title }
        ];
        console.log(`Deploying Pool from Source Tx ...`);
        const poolInitState = JSON.stringify(poolInitJson, null, 2);
        const poolDeployment = await arClient.warp.createContract.deployFromSourceTx({
            wallet: controlWallet,
            initState: poolInitState,
            srcTxId: poolSrcDeployment.id,
            tags: tags
        });
        POOLS_JSON[poolArg].contracts.pool.id = poolDeployment;
        fs_1.default.writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
        console.log(`Updated ${poolConfig.state.title} JSON Object - contracts.pool.id - [`, cli_color_1.default.green(`'${poolDeployment}'`), `]`);
    }
};
exports.default = command;
