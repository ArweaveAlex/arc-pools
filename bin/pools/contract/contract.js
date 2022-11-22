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
exports.__esModule = true;
exports.handle = void 0;
function addOrUpdateBigStrings(object, key, qty) {
    if (object[key]) {
        object[key] = (BigInt(object[key]) + qty).toString();
    }
    else {
        object[key] = qty.toString();
    }
}
function addOrUpdateIntStrings(object, key, qty) {
    if (object[key]) {
        object[key] = (parseInt(object[key]) + qty).toString();
    }
    else {
        object[key] = qty.toString();
    }
}
function handle(state, action) {
    return __awaiter(this, void 0, void 0, function () {
        var caller, contribution, target, totalSupply, totalContributions, mintedTokens, adjustmentFactor, sum, key, newAlloc;
        return __generator(this, function (_a) {
            caller = action.caller;
            switch (action.input["function"]) {
                case "contribute": {
                    contribution = BigInt(SmartWeave.transaction.quantity);
                    target = SmartWeave.transaction.target;
                    totalSupply = parseInt(state.totalSupply);
                    totalContributions = BigInt(state.totalContributions);
                    // check inputs
                    if (target != state.owner) {
                        throw new ContractError("Please fund the correct owner: ".concat(state.owner, "."));
                    }
                    if (contribution == BigInt(0)) {
                        throw new ContractError("Please fund a non-zero amount");
                    }
                    if (totalContributions == BigInt(0)) {
                        // mint 100% of supply
                        state.tokens = {};
                        state.tokens[caller] = "".concat(state.totalSupply);
                        addOrUpdateBigStrings(state.contributors, action.caller, contribution);
                        state.totalContributions = (totalContributions + contribution).toString();
                    }
                    else {
                        mintedTokens = (Number(BigInt(1000000000000) * contribution / totalContributions) / 1000000000000) * Number(totalSupply);
                        adjustmentFactor = Number(totalSupply) / Number(totalSupply + mintedTokens);
                        sum = 0;
                        for (key in state.tokens) {
                            newAlloc = state.tokens[key] * adjustmentFactor;
                            sum += newAlloc;
                            state.tokens[key] = newAlloc.toString();
                        }
                        addOrUpdateBigStrings(state, "balance", contribution);
                        addOrUpdateIntStrings(state.tokens, action.caller, totalSupply - sum);
                        addOrUpdateBigStrings(state.contributors, action.caller, contribution);
                        state.totalContributions = (totalContributions + contribution).toString();
                    }
                    return [2 /*return*/, { state: state }];
                }
                default: {
                    throw new ContractError("No action ".concat(action.input["function"], " exists. Please send a valid action."));
                }
            }
            return [2 /*return*/];
        });
    });
}
exports.handle = handle;
