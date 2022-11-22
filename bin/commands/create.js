"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var axios_1 = __importDefault(require("axios"));
var cli_color_1 = __importDefault(require("cli-color"));
var gql_1 = require("../gql");
var utils_1 = require("../utils");
var validations_1 = require("../validations");
var endpoints_1 = require("../endpoints");
var config_1 = require("../config");
var command = {
    name: config_1.CLI_ARGS.commands.create,
    execute: function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var poolConfig, POOLS_JSON, poolArg, arClient, exisitingPools, controlWallet, nftSrc, nftInitState, poolSrc, nftDeployment, nftDeploymentSrc, poolSrcDeployment, timestamp, poolInitJson, tags, poolInitState, poolDeployment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    poolConfig = (0, validations_1.validatePoolConfig)(args);
                    POOLS_JSON = JSON.parse(fs_1["default"].readFileSync(config_1.POOLS_PATH).toString());
                    poolArg = args.commandValues[0];
                    arClient = new gql_1.ArweaveClient();
                    return [4 /*yield*/, arClient.getAllPools()];
                case 1:
                    exisitingPools = _a.sent();
                    exisitingPools.forEach(function (pool) {
                        if (poolConfig.state.title === pool.state.title) {
                            (0, utils_1.exitProcess)("Pool Already Exists", 1);
                        }
                    });
                    try {
                        controlWallet = JSON.parse(fs_1["default"].readFileSync(config_1.CONTROL_WALLET_PATH).toString());
                        nftSrc = fs_1["default"].readFileSync(config_1.NFT_CONTRACT_PATH, "utf8");
                        nftInitState = JSON.parse(fs_1["default"].readFileSync(config_1.NFT_JSON_PATH, "utf8"));
                        poolSrc = fs_1["default"].readFileSync(config_1.POOL_CONTRACT_PATH, "utf8");
                    }
                    catch (_b) {
                        (0, utils_1.exitProcess)("Invalid Control Wallet / Contract Configuration", 1);
                    }
                    console.log("Deploying NFT Contract Source ...");
                    return [4 /*yield*/, arClient.warp.createContract.deploy({
                            src: nftSrc,
                            initState: JSON.stringify(nftInitState),
                            wallet: controlWallet
                        }, true)];
                case 2:
                    nftDeployment = _a.sent();
                    return [4 /*yield*/, axios_1["default"].get((0, endpoints_1.contractEndpoint)(nftDeployment))];
                case 3:
                    nftDeploymentSrc = (_a.sent()).data.srcTxId;
                    POOLS_JSON[poolArg].contracts.nft.id = nftDeployment;
                    POOLS_JSON[poolArg].contracts.nft.src = nftDeploymentSrc;
                    fs_1["default"].writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
                    console.log("Updated ".concat(poolConfig.state.title, " JSON Object - contracts.nft.id - ["), cli_color_1["default"].green("'".concat(nftDeployment, "'")), "]");
                    console.log("Updated ".concat(poolConfig.state.title, " JSON Object - contracts.nft.src - ["), cli_color_1["default"].green("'".concat(nftDeploymentSrc, "'")), "]");
                    console.log("Deploying Pool Contract Source ...");
                    return [4 /*yield*/, arClient.sourceImpl.save({ src: poolSrc }, controlWallet)];
                case 4:
                    poolSrcDeployment = _a.sent();
                    POOLS_JSON[poolArg].contracts.pool.src = poolSrcDeployment.id;
                    fs_1["default"].writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
                    console.log("Updated ".concat(poolConfig.state.title, " JSON Object - contracts.pool.src - ["), cli_color_1["default"].green("'".concat(poolSrcDeployment.id, "'")), "]");
                    timestamp = Date.now().toString();
                    POOLS_JSON[poolArg].state.timestamp = timestamp;
                    fs_1["default"].writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
                    console.log("Updated ".concat(poolConfig.state.title, " JSON Object - state.timestamp - "), cli_color_1["default"].green("'".concat(timestamp, "'")));
                    poolInitJson = {
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
                    tags = [
                        { "name": config_1.TAGS.keys.appType, "value": poolConfig.appType },
                        { "name": config_1.TAGS.keys.poolName, "value": poolConfig.state.title }
                    ];
                    console.log("Deploying Pool from Source Tx ...");
                    poolInitState = JSON.stringify(poolInitJson, null, 2);
                    return [4 /*yield*/, arClient.warp.createContract.deployFromSourceTx({
                            wallet: controlWallet,
                            initState: poolInitState,
                            srcTxId: poolSrcDeployment.id,
                            tags: tags
                        })];
                case 5:
                    poolDeployment = _a.sent();
                    POOLS_JSON[poolArg].contracts.pool.id = poolDeployment;
                    fs_1["default"].writeFileSync(config_1.POOLS_PATH, JSON.stringify(POOLS_JSON, null, 4));
                    console.log("Updated ".concat(poolConfig.state.title, " JSON Object - contracts.pool.id - ["), cli_color_1["default"].green("'".concat(poolDeployment, "'")), "]");
                    return [2 /*return*/];
            }
        });
    }); }
};
exports["default"] = command;
