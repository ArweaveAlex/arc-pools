"use strict";
function handle(state, action) {
    const input = action.input;
    const caller = action.caller;
  
    if (input.function === 'update') {
      if (state.owner !== caller) {
        throw new ContractError('Only the owner can update this contracts state.');
      }
  
      state = input.value;
  
      return state;
    }
  
    if (input.function === 'evolve' && state.canEvolve) {
      if (state.owner !== caller) {
        throw new ContractError('Only the owner can evolve a contract.');
      }
  
      state.evolve = input.value;
  
      return { state };
    }
  
    throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
}