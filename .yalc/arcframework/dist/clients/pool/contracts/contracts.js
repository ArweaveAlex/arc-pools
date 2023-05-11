"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POOL_CONTRACT_SRC = exports.NFT_CONTRACT_SRC = exports.NFT_INIT_STATE = void 0;
exports.NFT_INIT_STATE = {
    "title": "Alex Archiving Artifact",
    "name": "Artefact #000000",
    "description": "Minted from archiving pool Alex...",
    "ticker": "KOINFT",
    "balances": {},
    "maxSupply": 1,
    "contentType": "application/json",
    "transferable": false,
    "lockTime": 0,
    "lastTransferTimestamp": null
};
exports.NFT_CONTRACT_SRC = `
"use strict";
function handle(state, action) {
    const input = action.input;
    const caller = action.caller;
    if (input.function === "transfer") {
        ContractAssert(state.transferable ?? true, "Token cannot be transferred - soulbound");
        const current = SmartWeave.block.timestamp;
        if (state.lastTransferTimestamp && state.lockTime) {
            ContractAssert((current - state.lastTransferTimestamp) <= state.lockTime, "Token cannot be transferred - time-based soulbound");
        }
        const target = input.target;
        ContractAssert(target, "No target specified.");
        ContractAssert(caller !== target, "Invalid token transfer.");
        const qty = Number(input.qty) * Number(state.maxSupply);
        ContractAssert(qty && qty > 0 && Number.isInteger(qty), "No valid quantity specified.");
        const balances = state.balances;
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
        return { state };
    }
    if (input.function === "balance") {
        let target;
        if (input.target) {
            target = input.target;
        }
        else {
            target = caller;
        }
        const ticker = state.ticker;
        const balances = state.balances;
        ContractAssert(typeof target === "string", "Must specify target to retrieve balance for.");
        return {
            result: {
                target,
                ticker,
                balance: target in balances ? balances[target] / state.maxSupply : 0,
                intBalance: target in balances ? balances[target] : 0
            }
        };
    }
    throw new ContractError("No function supplied or function not recognised.");
}
`;
exports.POOL_CONTRACT_SRC = `
"use strict";
function addOrUpdateBigStrings(object, key, qty) {
    if (object[key]) {
        object[key] = (BigInt(object[key]) + qty).toString();
    }
    else {
        object[key] = qty.toString();
    }
}
function updateContributions(object, key, qty) {
    if (object[key]) {
        object[key].push({
            timestamp: Date.now().toString(), qty: BigInt(qty).toString()
        });
    }
    else {
        object[key] = [{ timestamp: Date.now().toString(), qty: qty.toString() }];
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
async function handle(state, action) {
    const caller = action.caller;
    const canEvolve = state.canEvolve;
    switch (action.input.function) {
        case "contribute": {
            const contribution = BigInt(SmartWeave.transaction.quantity);
            const target = SmartWeave.transaction.target;
            const totalSupply = parseInt(state.totalSupply);
            const totalContributions = BigInt(state.totalContributions);
            // check inputs
            if ((target !== state.owner) && (target !== state.controlPubkey)) {
                throw new ContractError("Please fund the correct owner or controller.");
            }
            if (contribution == BigInt(0)) {
                throw new ContractError("Please fund a non-zero amount");
            }
            if (totalContributions == BigInt(0)) {
                // mint 100% of supply
                state.tokens = {};
                state.tokens[caller] = state.totalSupply.toString();
                updateContributions(state.contributors, action.caller, contribution);
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
                updateContributions(state.contributors, action.caller, contribution);
                state.totalContributions = (totalContributions + contribution).toString();
            }
            return { state };
        }
        case "setTopics": {
            if (state.owner !== caller) {
                throw new ContractError('Only the owner can add topics.');
            }
        
            // set topic values to input list
            state.topics = action.input.data;
        
            return { state };
        }
        case "evolve": {
            if (canEvolve) {
                if (state.owner !== caller) {
                  throw new ContractError('Only the owner can evolve a contract.');
                }
            
                state.evolve = action.input.value;
            
                return { state };
            }
        }
        default: {
            throw new ContractError("No action " + action.input.function + " exists. Please send a valid action.");
        }
    }
}
`;
