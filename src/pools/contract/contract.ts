declare let ContractError: new (string) => Error;
declare let SmartWeave: any;


function addOrUpdateBigStrings(object, key, qty) {
	if (object[key]) {
		object[key] = (BigInt(object[key]) + qty).toString();
	} else {
		object[key] = qty.toString();
	}
}

function addOrUpdateIntStrings(object, key, qty) {
	if (object[key]) {
		object[key] = (parseInt(object[key]) + qty).toString();
	} else {
		object[key] = qty.toString();
	}
}

export async function handle(state, action) {
	const caller = action.caller;
	switch (action.input.function) {
		case "contribute": {
			const contribution = BigInt(SmartWeave.transaction.quantity);
			const target = SmartWeave.transaction.target;
			const totalSupply = parseInt(state.totalSupply);
			const totalContributions = BigInt(state.totalContributions)
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
			} else {

				// calculate new mints
				const mintedTokens = (Number(BigInt(1000000000000) * contribution / totalContributions) / 1000000000000) * Number(totalSupply)
				const adjustmentFactor = Number(totalSupply) / Number(totalSupply + mintedTokens);

				let sum = 0;
				for (const key in state.tokens) {
					const newAlloc = state.tokens[key] * adjustmentFactor
					sum += newAlloc;
					state.tokens[key] = newAlloc.toString();
				}
				addOrUpdateBigStrings(state, "balance", contribution)
				addOrUpdateIntStrings(state.tokens, action.caller, totalSupply - sum);
				addOrUpdateBigStrings(state.contributors, action.caller, contribution);
				state.totalContributions = (totalContributions + contribution).toString();
			}
			return { state };
		}
		default: {
			throw new ContractError(
				`No action ${action.input.function} exists. Please send a valid action.`
			);
		}
	}
}