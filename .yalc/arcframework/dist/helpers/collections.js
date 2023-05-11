"use strict";
// import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy';
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTION_CONTRACT = exports.getCollectionsByOwner = exports.getCollection = exports.getContractById = exports.saveCollection = exports.createCollection = exports.initCollection = void 0;
const clients_1 = require("../clients");
// import { getGQLData } from 'arcframework';
// import { TAGS } from 'helpers/config';
// const arClient = new ArweaveClient('arweave.net');
// TODO: Move to Client
function initCollection() {
    return {
        title: '',
        name: '',
        description: '',
        ticker: 'ALEXCOLLECTION',
        balances: {},
        maxSupply: 1,
        transferable: true,
        lockTime: 0,
        lastTransferTimestamp: '',
        ids: [],
        owner: '',
        phase: 'INPROGRESS',
        topic: '',
        timestamp: '',
    };
}
exports.initCollection = initCollection;
async function createCollection(collectionState) {
    // if (window.arweaveWallet) {
    // 	await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY', 'SIGNATURE']);
    // }
    // const userSigner = new InjectedArweaveSigner(window.arweaveWallet);
    // await userSigner.setPublicKey();
    console.log(collectionState);
    // const tags = [
    // 	{ name: TAGS.keys.appType, value: TAGS.values.collectionAppType },
    // 	{ name: TAGS.keys.collectionName, value: collectionState.title },
    // 	{ name: TAGS.keys.collectionDescription, value: collectionState.description },
    // 	{ name: TAGS.keys.ansTitle, value: collectionState.title },
    // 	{ name: `${TAGS.keys.ansTopic}:${collectionState.topic}`, value: collectionState.topic },
    // 	{ name: TAGS.keys.ansDescription, value: collectionState.description },
    // 	{ name: TAGS.keys.ansType, value: TAGS.values.ansType },
    // 	{ name: TAGS.keys.ansImplements, value: TAGS.values.ansVersion },
    // 	{ name: TAGS.keys.initialOwner, value: collectionState.owner },
    // ];
    // TODO: Integrate with arcframework
    // const collectionContract = await arClient.warp.createContract.deploy({
    // 	src: COLLECTION_CONTRACT,
    // 	initState: JSON.stringify(collectionState),
    // 	wallet: userSigner,
    // 	tags: tags,
    // });
    // return {
    // 	id: collectionContract.contractTxId,
    // 	state: collectionState,
    // };
    return {
        id: 'Temp',
        state: {
            ids: ['string[]'],
            title: 'string',
            topic: 'string',
            name: 'string',
            ticker: 'string',
            balances: 'any',
            maxSupply: 1,
            transferable: false,
            owner: 'string',
            phase: 'string',
            description: 'string',
            timestamp: 'string',
            lockTime: 1,
            lastTransferTimestamp: 'string',
        },
    };
}
exports.createCollection = createCollection;
async function saveCollection(collection) {
    const arClient = new clients_1.ArweaveClient();
    const warpContract = arClient.warp.contract(collection.id).connect('use_wallet').setEvaluationOptions({
        waitForConfirmation: false,
    });
    const result = await warpContract.writeInteraction({
        function: 'add',
        ids: collection.state.ids,
        title: collection.state.title,
        name: collection.state.name,
        description: collection.state.description,
        topic: collection.state.topic,
    });
    // TODO: Language to site provider
    if (result) {
        return { status: true, message: `Collection saved!` };
    }
    return { status: true, message: `Collection failed to save` };
}
exports.saveCollection = saveCollection;
async function getContractById(contractId) {
    const arClient = new clients_1.ArweaveClient();
    try {
        const contract = arClient.warp.contract(contractId).setEvaluationOptions({ allowBigInt: true });
        return {
            id: contractId,
            state: (await contract.readState()).cachedValue.state,
        };
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.getContractById = getContractById;
async function getCollection(collectionContractId) {
    return await getContractById(collectionContractId);
}
exports.getCollection = getCollection;
async function getCollectionsByOwner(walletAddress) {
    console.log(walletAddress);
    let collectionsByOwner = [];
    // const collections: ArcGQLResponseType = await getGQLData({
    // 	ids: null,
    // 	tagFilters: [
    // 		{
    // 			name: TAGS.keys.appType,
    // 			values: [TAGS.values.collectionAppType],
    // 		},
    // 		{
    // 			name: TAGS.keys.initialOwner,
    // 			values: [walletAddress],
    // 		},
    // 	],
    // 	uploader: null,
    // 	cursor: null,
    // 	reduxCursor: null,
    // 	cursorObject: null,
    // });
    // collectionsByOwner = await Promise.all(
    // 	collections.data.map(async (collection: GQLResponseType) => {
    // 		let contract = await getContractById(collection.node.id);
    // 		return contract;
    // 	})
    // );
    return collectionsByOwner;
}
exports.getCollectionsByOwner = getCollectionsByOwner;
exports.COLLECTION_CONTRACT = `
'use strict';
async function handle(state, action) {
	const input = action.input;
	const caller = action.caller;
	const canEvolve = state.canEvolve;
	switch (action.input.function) {
		case 'add': {
			if (state.owner !== caller) {
				throw new ContractError('Only the owner can update this contracts state.');
			}
			let inputIds = input.ids;
			let existingIds = state.ids;

			let finalIds = [...new Set(existingIds.concat(inputIds))];

			state.ids = finalIds;

			state.title = input.title ? input.title : state.title;
			state.name = input.name ? input.name : state.name;
			state.topic = input.topic ? input.topic : state.topic;
			state.description = input.description ? input.description : state.description;

			return { state };
		}
		case 'remove': {
			if (state.owner !== caller) {
				throw new ContractError('Only the owner can update this contracts state.');
			}
			let inputIds = input.ids;
			let existingIds = state.ids;

			let finalIds = existingIds.filter((id) => {
				return !inputIds.includes(id);
			});

			state.ids = finalIds;

			state.title = input.title ? input.title : state.title;
			state.name = input.name ? input.name : state.name;
			state.topic = input.topic ? input.topic : state.topic;
			state.description = input.description ? input.description : state.description;

			return { state };
		}
		case 'transfer': {
			ContractAssert(state.transferable ?? true, 'Token cannot be transferred - soulbound');
			const current = SmartWeave.block.timestamp;
			if (state.lastTransferTimestamp && state.lockTime) {
				ContractAssert(current - state.lastTransferTimestamp <= state.lockTime, 'Token cannot be transferred - time-based soulbound');
			}
			const target = input.target;
			ContractAssert(target, 'No target specified.');
			ContractAssert(caller !== target, 'Invalid token transfer.');
			const qty = Number(input.qty) * Number(state.maxSupply);
			ContractAssert(qty && qty > 0 && Number.isInteger(qty), 'No valid quantity specified.');
			const balances = state.balances;
			ContractAssert(caller in balances && balances[caller] >= qty, 'Caller has insufficient funds');
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
		case 'balance': {
			let target;
			if (input.target) {
				target = input.target;
			} else {
				target = caller;
			}
			const ticker = state.ticker;
			const balances = state.balances;
			ContractAssert(typeof target === 'string', 'Must specify target to retrieve balance for.');
			return {
				result: {
					target,
					ticker,
					balance: target in balances ? balances[target] / state.maxSupply : 0,
					intBalance: target in balances ? balances[target] : 0,
				},
			};
		}
		case 'evolve': {
			if (canEvolve) {
				if (state.owner !== caller) {
					throw new ContractError('Only the owner can evolve a contract.');
				}

				state.evolve = input.value;

				return { state };
			}
		}
		default: {
			throw new ContractError('Action does not exist please send a valid action.');
		}
	}
}
`;
