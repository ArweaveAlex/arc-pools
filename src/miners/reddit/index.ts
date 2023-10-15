import { ArtifactEnum, CONTENT_TYPES, createAsset, IPoolClient, RENDER_WITH_VALUES, TAGS } from 'arcframework';
import { mkdir } from 'fs/promises';
import path from 'path';
import tmp from 'tmp-promise';

import { ServiceClient } from '../../clients/service';
import {
	checkPath,
	generateRedditAssetDescription,
	generateRedditAssetName,
	log,
	logValue,
	traverse,
	uploadFile,
} from '../../helpers/utils';
import { shouldUploadContent } from '../moderator';

export async function processPosts(
	poolClient: IPoolClient,
	serviceClient: ServiceClient,
	args: {
		posts: any[];
		contentModeration: boolean;
	}
) {
	let parentPosts = args.posts;

	logValue(`Reddit Parent Thread Count`, parentPosts.length.toString(), 0);

	let iterPosts = parentPosts;

	for (let i = 0; i < iterPosts.length; i++) {
		let url = `/comments/${iterPosts[i].data.id}?depth=50`;

		let postWithComments = await serviceClient.reddit.get(url);

		const isDup = await poolClient.arClient.isDuplicate({
			artifactName: generateRedditAssetName(postWithComments),
			poolId: poolClient.poolConfig.contracts.pool.id,
		});

		if (!isDup) {
			await processPost(poolClient, { post: postWithComments, contentModeration: args.contentModeration });
		} else {
			log(`Skipping duplicate artifact...`, null);
		}
	}
}

async function processPost(
	poolClient: IPoolClient,
	args: {
		post: any;
		contentModeration: boolean;
	}
) {
	const tmpdir = await tmp.dir({ unsafeCleanup: true });

	await processMedia(poolClient, {
		post: args.post,
		tmpdir: tmpdir,
		contentModeration: args.contentModeration,
	});

	log('Processing Reddit Post...', 0);
	const contractId = await createAsset(poolClient, {
		index: { path: 'post.json' },
		paths: (assetId: string) => ({ 'post.json': { id: assetId } }),
		content: args.post,
		contentType: CONTENT_TYPES.json,
		artifactType: ArtifactEnum.Reddit,
		name: generateRedditAssetName(args.post),
		description: generateRedditAssetDescription(args.post),
		type: TAGS.values.ansTypes.socialPost,
		additionalMediaPaths: [],
		profileImagePath: null,
		associationId: null,
		associationSequence: null,
		childAssets: null,
		renderWith: RENDER_WITH_VALUES,
		assetId: args.post[0].data.id,
	});

	if (contractId) {
		return contractId;
	}
}

async function processMedia(
	poolClient: IPoolClient,
	args: {
		post: any;
		tmpdir: any;
		contentModeration: boolean;
	}
) {
	let modifyPost = args.post;
	const mediaDir = path.join(args.tmpdir.path, 'media');
	if (!(await checkPath(mediaDir))) {
		await mkdir(mediaDir);
	}

	try {
		let topLevelPost = args.post[0].data;
		if (topLevelPost.children[0].data.media_metadata) {
			let a = {
				...args,
				...{ mediaMetaData: topLevelPost.children[0].data.media_metadata, mediaDir: mediaDir },
			};
			await processMediaMetadata(poolClient, a);
		}
		if (topLevelPost.children[0].data.preview) {
			let a = {
				...args,
				...{ preview: topLevelPost.children[0].data.preview, mediaDir: mediaDir },
			};
			await processPreview(poolClient, a);
		}
		if (args.post[1]) {
			let commentPosts = args.post[1].data.children;
			await traverse(['media_metadata'], commentPosts, async (obj: any, key: string) => {
				if (key === 'media_metadata') {
					let a = { ...args, ...{ mediaMetaData: obj, mediaDir: mediaDir } };
					await processMediaMetadata(poolClient, a);
				}
			});
		}
	} catch (e: any) {
		console.log(`Error while archiving media: ${e}`, 1);
	}
	return modifyPost;
}

async function processMediaMetadata(
	poolClient: IPoolClient,
	args: {
		post: any;
		tmpdir: any;
		contentModeration: boolean;
		mediaMetaData: any;
		mediaDir: string;
	}
) {
	for (const [key, _value] of Object.entries(args.mediaMetaData)) {
		let singleFile: any = args.mediaMetaData[key];
		let postTopLevelFile = singleFile.s;
		let fileType = singleFile.e;
		let url = null;
		let contentModeratorType = null;

		if (fileType === 'AnimatedImage') {
			if (postTopLevelFile.mp4) {
				url = postTopLevelFile.mp4.replace(/&amp;/g, '&');
				contentModeratorType = 'video';
			}
		} else if (fileType === 'Image') {
			if (postTopLevelFile.u) {
				url = postTopLevelFile.u.replace(/&amp;/g, '&');
				contentModeratorType = 'image';
			}
		} else if (fileType === 'Video') {
			if (postTopLevelFile.mp4) {
				url = postTopLevelFile.mp4.replace(/&amp;/g, '&');
				contentModeratorType = 'video';
			}
		}

		if (url) {
			if (!(await checkPath(args.mediaDir))) {
				await mkdir(args.mediaDir);
			}

			if (args.contentModeration) {
				let contentCheck = await shouldUploadContent(url, contentModeratorType, poolClient.poolConfig);
				if (!contentCheck) {
					log('Explicit content not uploading', 0);
					return;
				}
			}

			const subTags = [
				{ name: TAGS.keys.application, value: TAGS.values.application },
				{ name: TAGS.keys.redditPostId, value: `${args.post[0].data.id ?? 'unknown'}` },
			];

			let txId = await uploadFile(poolClient, args.mediaDir, url, { ...{ tags: subTags }, ...args });

			if (!txId) continue;

			if (fileType === 'AnimatedImage') {
				singleFile.s.gif = 'https://arweave.net/' + txId;
			} else if (fileType === 'Image') {
				singleFile.s.u = 'https://arweave.net/' + txId;
			} else if (fileType === 'Video') {
				singleFile.s.mp4 = 'https://arweave.net/' + txId;
			}
		}
	}
}

async function processPreview(
	poolClient: IPoolClient,
	args: {
		post: any;
		tmpdir: any;
		contentModeration: boolean;
		preview: any;
		mediaDir: string;
	}
) {
	if (args.preview.images) {
		let imageList = args.preview.images;
		for (let i = 0; i < imageList.length; i++) {
			let source = imageList[i].source;
			let url = source.url.replace(/&amp;/g, '&');

			if (args.contentModeration) {
				let contentCheck = await shouldUploadContent(url, 'image', poolClient.poolConfig);
				if (!contentCheck) {
					log('Explicit content not uploading', 0);
					return;
				}
			}

			const subTags = [
				{ name: TAGS.keys.application, value: TAGS.values.application },
				{ name: TAGS.keys.redditPostId, value: `${args.post[0].data.id ?? 'unknown'}` },
			];

			let txId = await uploadFile(poolClient, args.mediaDir, url, { ...{ tags: subTags }, ...args });

			imageList[i].source.url = 'https://arweave.net/' + txId;
		}
	}
}
