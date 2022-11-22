"use strict";
exports.__esModule = true;
exports.handle = void 0;
function handle(state, action) {
    var _a;
    var input = action.input;
    var caller = action.caller;
    if (input["function"] === "transfer") {
        ContractAssert((_a = state.transferable) !== null && _a !== void 0 ? _a : true, "Token cannot be transferred - soulbound");
        var current = SmartWeave.block.timestamp;
        if (state.lastTransferTimestamp && state.lockTime) {
            ContractAssert((current - state.lastTransferTimestamp) <= state.lockTime, "Token cannot be transferred - time-based soulbound");
        }
        var target = input.target;
        ContractAssert(target, "No target specified.");
        ContractAssert(caller !== target, "Invalid token transfer.");
        var qty = Number(input.qty) * Number(state.maxSupply);
        ContractAssert(qty && qty > 0 && Number.isInteger(qty), "No valid quantity specified.");
        var balances = state.balances;
        ContractAssert(caller in balances && balances[caller] >= qty, "Caller has insufficient funds");
        balances[caller] -= qty;
        if (balances[caller] === 0) {
            delete balances[caller];
        }
        if (!(target in balances)) {
            balances[target] = 0;
        }
        balances[target] += qty;
        state.balances = balances;
        state.lastTransferTimestamp = current;
        return { state: state };
    }
    if (input["function"] === "balance") {
        var target = void 0;
        if (input.target) {
            target = input.target;
        }
        else {
            target = caller;
        }
        var ticker = state.ticker;
        var balances = state.balances;
        ContractAssert(typeof target === "string", "Must specify target to retrieve balance for.");
        return {
            result: {
                target: target,
                ticker: ticker,
                balance: target in balances ? balances[target] / state.maxSupply : 0,
                intBalance: target in balances ? balances[target] : 0
            }
        };
    }
    throw new ContractError("No function supplied or function not recognised: \"".concat(input["function"], "\"."));
}
exports.handle = handle;
