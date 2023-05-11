import { CollectionStateType, CollectionType } from './types';
export declare function initCollection(): CollectionStateType;
export declare function createCollection(collectionState: CollectionStateType): Promise<{
    id: string;
    state: {
        ids: string[];
        title: string;
        topic: string;
        name: string;
        ticker: string;
        balances: string;
        maxSupply: number;
        transferable: boolean;
        owner: string;
        phase: string;
        description: string;
        timestamp: string;
        lockTime: number;
        lastTransferTimestamp: string;
    };
}>;
export declare function saveCollection(collection: CollectionType): Promise<{
    status: boolean;
    message: string;
}>;
export declare function getContractById(contractId: string): Promise<CollectionType | null>;
export declare function getCollection(collectionContractId: string): Promise<CollectionType>;
export declare function getCollectionsByOwner(walletAddress: string): Promise<CollectionType[]>;
export declare const COLLECTION_CONTRACT = "\n'use strict';\nasync function handle(state, action) {\n\tconst input = action.input;\n\tconst caller = action.caller;\n\tconst canEvolve = state.canEvolve;\n\tswitch (action.input.function) {\n\t\tcase 'add': {\n\t\t\tif (state.owner !== caller) {\n\t\t\t\tthrow new ContractError('Only the owner can update this contracts state.');\n\t\t\t}\n\t\t\tlet inputIds = input.ids;\n\t\t\tlet existingIds = state.ids;\n\n\t\t\tlet finalIds = [...new Set(existingIds.concat(inputIds))];\n\n\t\t\tstate.ids = finalIds;\n\n\t\t\tstate.title = input.title ? input.title : state.title;\n\t\t\tstate.name = input.name ? input.name : state.name;\n\t\t\tstate.topic = input.topic ? input.topic : state.topic;\n\t\t\tstate.description = input.description ? input.description : state.description;\n\n\t\t\treturn { state };\n\t\t}\n\t\tcase 'remove': {\n\t\t\tif (state.owner !== caller) {\n\t\t\t\tthrow new ContractError('Only the owner can update this contracts state.');\n\t\t\t}\n\t\t\tlet inputIds = input.ids;\n\t\t\tlet existingIds = state.ids;\n\n\t\t\tlet finalIds = existingIds.filter((id) => {\n\t\t\t\treturn !inputIds.includes(id);\n\t\t\t});\n\n\t\t\tstate.ids = finalIds;\n\n\t\t\tstate.title = input.title ? input.title : state.title;\n\t\t\tstate.name = input.name ? input.name : state.name;\n\t\t\tstate.topic = input.topic ? input.topic : state.topic;\n\t\t\tstate.description = input.description ? input.description : state.description;\n\n\t\t\treturn { state };\n\t\t}\n\t\tcase 'transfer': {\n\t\t\tContractAssert(state.transferable ?? true, 'Token cannot be transferred - soulbound');\n\t\t\tconst current = SmartWeave.block.timestamp;\n\t\t\tif (state.lastTransferTimestamp && state.lockTime) {\n\t\t\t\tContractAssert(current - state.lastTransferTimestamp <= state.lockTime, 'Token cannot be transferred - time-based soulbound');\n\t\t\t}\n\t\t\tconst target = input.target;\n\t\t\tContractAssert(target, 'No target specified.');\n\t\t\tContractAssert(caller !== target, 'Invalid token transfer.');\n\t\t\tconst qty = Number(input.qty) * Number(state.maxSupply);\n\t\t\tContractAssert(qty && qty > 0 && Number.isInteger(qty), 'No valid quantity specified.');\n\t\t\tconst balances = state.balances;\n\t\t\tContractAssert(caller in balances && balances[caller] >= qty, 'Caller has insufficient funds');\n\t\t\tbalances[caller] -= qty;\n\t\t\tif (balances[caller] === 0) {\n\t\t\t\tdelete balances[caller];\n\t\t\t}\n\t\t\tif (!(target in balances)) {\n\t\t\t\tbalances[target] = 0;\n\t\t\t}\n\t\t\tbalances[target] += qty;\n\t\t\tstate.balances = balances;\n\t\t\tstate.lastTransferTimestamp = current;\n\t\t\treturn { state };\n\t\t}\n\t\tcase 'balance': {\n\t\t\tlet target;\n\t\t\tif (input.target) {\n\t\t\t\ttarget = input.target;\n\t\t\t} else {\n\t\t\t\ttarget = caller;\n\t\t\t}\n\t\t\tconst ticker = state.ticker;\n\t\t\tconst balances = state.balances;\n\t\t\tContractAssert(typeof target === 'string', 'Must specify target to retrieve balance for.');\n\t\t\treturn {\n\t\t\t\tresult: {\n\t\t\t\t\ttarget,\n\t\t\t\t\tticker,\n\t\t\t\t\tbalance: target in balances ? balances[target] / state.maxSupply : 0,\n\t\t\t\t\tintBalance: target in balances ? balances[target] : 0,\n\t\t\t\t},\n\t\t\t};\n\t\t}\n\t\tcase 'evolve': {\n\t\t\tif (canEvolve) {\n\t\t\t\tif (state.owner !== caller) {\n\t\t\t\t\tthrow new ContractError('Only the owner can evolve a contract.');\n\t\t\t\t}\n\n\t\t\t\tstate.evolve = input.value;\n\n\t\t\t\treturn { state };\n\t\t\t}\n\t\t}\n\t\tdefault: {\n\t\t\tthrow new ContractError('Action does not exist please send a valid action.');\n\t\t}\n\t}\n}\n";
