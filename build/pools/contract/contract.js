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
Object.defineProperty(exports, "__esModule", { value: true });
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
    return __awaiter(this, void 0, void 0, function* () {
        const caller = action.caller;
        switch (action.input.function) {
            case "contribute": {
                const contribution = BigInt(SmartWeave.transaction.quantity);
                const target = SmartWeave.transaction.target;
                const totalSupply = parseInt(state.totalSupply);
                const totalContributions = BigInt(state.totalContributions);
                // check inputs
                if (target != state.owner) {
                    throw new ContractError(`Please fund the correct owner: ${state.owner}.`);
                }
                if (contribution == BigInt(0)) {
                    throw new ContractError("Please fund a non-zero amount");
                }
                if (totalContributions == BigInt(0)) {
                    // mint 100% of supply
                    state.tokens = {};
                    state.tokens[caller] = `${state.totalSupply}`;
                    addOrUpdateBigStrings(state.contributors, action.caller, contribution);
                    state.totalContributions = (totalContributions + contribution).toString();
                }
                else {
                    // calculate new mints
                    const mintedTokens = (Number(BigInt(1000000000000) * contribution / totalContributions) / 1000000000000) * Number(totalSupply);
                    const adjustmentFactor = Number(totalSupply) / Number(totalSupply + mintedTokens);
                    let sum = 0;
                    for (const key in state.tokens) {
                        const newAlloc = state.tokens[key] * adjustmentFactor;
                        sum += newAlloc;
                        state.tokens[key] = newAlloc.toString();
                    }
                    addOrUpdateBigStrings(state, "balance", contribution);
                    addOrUpdateIntStrings(state.tokens, action.caller, totalSupply - sum);
                    addOrUpdateBigStrings(state.contributors, action.caller, contribution);
                    state.totalContributions = (totalContributions + contribution).toString();
                }
                return { state };
            }
            default: {
                throw new ContractError(`No action ${action.input.function} exists. Please send a valid action.`);
            }
        }
    });
}
exports.handle = handle;
