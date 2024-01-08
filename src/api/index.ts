import Irys from '@irys/sdk';

import {
	ArtifactEnum,
	CONTENT_TYPES,
	createContractTags,
	getGQLData,
	IPoolClient,
	log,
	logValue,
	UPLOAD_CONFIG,
} from 'arcframework';

export async function createAsset(
	poolClient: IPoolClient,
	args: {
		index: any;
		paths: any;
		content: any;
		contentType: string;
		artifactType: ArtifactEnum;
		name: string;
		description: string;
		type: string;
		additionalMediaPaths: any;
		profileImagePath: any;
		associationId: string | null;
		associationSequence: string | null;
		childAssets: string[] | null;
		renderWith: string[] | null;
		assetId: string;
		fileType?: string;
		dataProtocol?: string;
	}
) {
	const contractTags = await createContractTags(poolClient, {
		index: args.index,
		paths: args.paths,
		contentType: args.contentType,
		artifactType: args.artifactType,
		name: args.name,
		description: args.description,
		type: args.type,
		additionalMediaPaths: args.additionalMediaPaths,
		profileImagePath: args.profileImagePath,
		associationId: args.associationId,
		associationSequence: args.associationSequence,
		childAssets: args.childAssets,
		renderWith: args.renderWith,
		assetId: args.assetId,
		fileType: args.fileType,
		dataProtocol: args.dataProtocol,
	});

	const assetId: string = await createTransaction(poolClient, {
		content: args.content,
		contentType: args.contentType,
		tags: contractTags,
	});

	await new Promise((r) => setTimeout(r, 2000));

	let fetchedAssetId: string;
	while (!fetchedAssetId) {
		await new Promise((r) => setTimeout(r, 2000));
		const gqlResponse = await getGQLData({
			ids: [assetId],
			tagFilters: null,
			uploaders: null,
			cursor: null,
			reduxCursor: null,
			cursorObject: null,
			useArweavePost: true,
		});

		if (gqlResponse && gqlResponse.data.length) {
			logValue(`Fetched Transaction`, gqlResponse.data[0].node.id, 0);
			fetchedAssetId = gqlResponse.data[0].node.id;
		} else {
			logValue(`Transaction Not Found`, assetId, 0);
		}
	}

	const contractId = await createContract(poolClient, { assetId: assetId });
	if (contractId) {
		logValue(`Deployed Contract`, contractId, 0);
		return contractId;
	} else {
		return null;
	}
}

export async function createTransaction(
	poolClient: IPoolClient,
	args: {
		content: any;
		contentType: string;
		tags: any;
	}
) {
	let finalContent: any;

	switch (args.contentType) {
		case CONTENT_TYPES.json as any:
			finalContent = JSON.stringify(args.content);
			break;
		default:
			finalContent = args.content;
			break;
	}

	try {
		if (poolClient.poolConfig.walletKey) {
			const irys = new Irys({ url: UPLOAD_CONFIG.node2, token: 'arweave', key: poolClient.poolConfig.walletKey });
			const txResponse = await irys.upload(finalContent as any, { tags: args.tags } as any);
			return txResponse.id;
		} else {
			console.log('Wallet key required to create transactions');
			return null;
		}
	} catch (e: any) {
		throw new Error(`Error creating transaction ...\n ${e}`);
	}
}

export async function createContract(poolClient: IPoolClient, args: { assetId: string }) {
	try {
		const { contractTxId } = await poolClient.arClient.warpDefault.register(args.assetId, 'arweave');
		return contractTxId;
	} catch (e: any) {
		console.error(e);
		logValue(`Error creating contract - Asset ID`, args.assetId, 1);

		const errorString = e.toString();
		if (errorString.indexOf('500') > -1) {
			return null;
		}

		if (errorString.indexOf('502') > -1 || errorString.indexOf('504') > -1 || errorString.indexOf('FetchError') > -1) {
			let retries = 5;
			for (let i = 0; i < retries; i++) {
				await new Promise((r) => setTimeout(r, 2000));
				try {
					log(`Retrying Warp ...`, null);
					const { contractTxId } = await poolClient.arClient.warpDefault.register(args.assetId, 'arweave');
					log(`Retry succeeded`, 0);
					return contractTxId;
				} catch (e2: any) {
					logValue(`Error creating contract - Asset ID`, args.assetId, 1);
					continue;
				}
			}
		}
	}

	throw new Error(`Warp retries failed ...`);
}
