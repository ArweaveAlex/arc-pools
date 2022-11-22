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
var arweave_1 = __importDefault(require("arweave"));
var gql = __importStar(require("gql-query-builder"));
var warp_contracts_1 = require("warp-contracts");
var config_1 = require("../config");
var PAGINATOR = 100;
var GQLCLient = /** @class */ (function () {
    function GQLCLient() {
        this.arweave = arweave_1["default"].init({
            host: "arweave.net",
            port: 443,
            protocol: "https",
            timeout: 40000,
            logging: false
        });
        this.smartweave = warp_contracts_1.WarpNodeFactory.memCachedBased(this.arweave).useArweaveGateway().build();
        this.warp = warp_contracts_1.WarpNodeFactory.memCached(this.arweave);
    }
    GQLCLient.prototype.getPoolIds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var aggregatedPools, cursor, query, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Fetching Pool IDs ...");
                        aggregatedPools = [];
                        cursor = "";
                        query = function (cursor) { return gql.query({
                            operation: "transactions",
                            variables: {
                                tags: {
                                    value: {
                                        name: config_1.TAGS.keys.appType,
                                        values: [config_1.TAGS.values.poolv1]
                                    },
                                    type: "[TagFilter!]"
                                },
                                first: PAGINATOR,
                                after: cursor
                            },
                            fields: [
                                {
                                    edges: [
                                        "cursor",
                                        {
                                            node: [
                                                "id"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }); };
                        _a.label = 1;
                    case 1:
                        if (!(cursor !== null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.arweave.api.post("/graphql", query(cursor))];
                    case 2:
                        response = _a.sent();
                        if (response.data.data) {
                            responseData = response.data.data.transactions.edges;
                            if (responseData.length > 0) {
                                cursor = responseData[responseData.length - 1].cursor;
                                aggregatedPools.push.apply(aggregatedPools, responseData);
                                if (responseData.length < PAGINATOR) {
                                    cursor = null;
                                }
                            }
                            else {
                                cursor = null;
                            }
                        }
                        else {
                            cursor = null;
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, aggregatedPools.map(function (element) {
                            return element.node.id;
                        })];
                }
            });
        });
    };
    GQLCLient.prototype.getAllPools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var collections, POOL_IDS, i, contract, _a, _b, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("Fetching Pools ...");
                        collections = [];
                        return [4 /*yield*/, this.getPoolIds()];
                    case 1:
                        POOL_IDS = _d.sent();
                        i = 0;
                        _d.label = 2;
                    case 2:
                        if (!(i < POOL_IDS.length)) return [3 /*break*/, 7];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        contract = this.smartweave.contract(POOL_IDS[i]);
                        _b = (_a = collections).push;
                        _c = { id: POOL_IDS[i] };
                        return [4 /*yield*/, contract.readState()];
                    case 4:
                        _b.apply(_a, [(_c.state = (_d.sent()).state, _c)]);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
                        console.error(error_1);
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, collections];
                }
            });
        });
    };
    return GQLCLient;
}());
exports["default"] = GQLCLient;
