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
                throw new ContractError(`Please fund the correct owner or controller.`);
            }
            if (contribution == BigInt(0)) {
                throw new ContractError("Please fund a non-zero amount");
            }
            if (totalContributions == BigInt(0)) {
                // mint 100% of supply
                state.tokens = {};
                state.tokens[caller] = `${state.totalSupply}`;
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
            throw new ContractError(`No action ${action.input.function} exists. Please send a valid action.`);
        }
    }
}
