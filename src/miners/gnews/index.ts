import { Readability } from '@mozilla/readability';
import { mkdir } from 'fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import * as path from 'path';
import tmp from 'tmp-promise';

import { ArtifactEnum, CONTENT_TYPES, IPoolClient, RENDER_WITH_VALUES, TAGS } from 'arcframework';

import { createAsset } from '../../api';
import { GNewsArticleType } from '../../helpers/types';
import { checkPath, log, processMediaPaths, processMediaURL } from '../../helpers/utils';

export async function processArticles(
	poolClient: IPoolClient,
	args: {
		articles: GNewsArticleType[];
	}
) {
	for (let i = 0; i < args.articles.length; i++) {
		const isDup = await poolClient.arClient.isDuplicate({
			artifactName: args.articles[i].title,
			poolId: poolClient.poolConfig.contracts.pool.id,
		});

		if (!isDup) {
			try {
				await processArticle(poolClient, { article: args.articles[i] });
			} catch (e: any) {
				log(e.message ? e.message : 'Error occurred', 1);
			}
		} else {
			log(`Skipping duplicate artifact...`, null);
		}
	}
}

async function processArticle(
	poolClient: IPoolClient,
	args: {
		article: GNewsArticleType;
	}
) {
	let finalArticle = { ...args.article };

	const tmpdir = await tmp.dir({ unsafeCleanup: true });
	let htmlResult: any;
	let htmlContent: any;
	try {
		htmlResult = await fetch(args.article.url);
		if (!htmlResult.ok) {
			throw new Error(`Failed to fetch article with status: ${htmlResult.status}`);
		}
		htmlContent = await htmlResult.text();
	} catch (e) {
		throw new Error(`Failed to fetch article: ${args.article.url}`);
	}

	try {
		const virtualConsole = new VirtualConsole();
		virtualConsole.sendTo(console, { omitJSDOMErrors: true });
		const dom = new JSDOM(htmlContent, {
			url: finalArticle.url,
			virtualConsole: virtualConsole,
		});

		const readableHtml = new Readability(dom.window.document).parse();
		if (readableHtml && readableHtml.textContent) {
			finalArticle.content = readableHtml.content;

			const readableDom = new JSDOM(readableHtml.content);
			const images = readableDom.window.document.querySelectorAll('img');

			const imgSrcs = [];
			images.forEach((img) => {
				imgSrcs.push(img.src);
			});
		}
	} catch (e: any) {
		throw new Error(`Failed to parse article: ${args.article.url}`);
	}

	let additionalMediaPaths: any = null;
	if (finalArticle.image) {
		try {
			const mediaDir = path.join(tmpdir.path, 'media');

			if (!(await checkPath(mediaDir))) {
				await mkdir(mediaDir);
			}

			await processMediaURL(finalArticle.image, mediaDir, 0);

			additionalMediaPaths = await processMediaPaths(poolClient, {
				subTags: [],
				tmpdir: tmpdir,
				path: 'media',
			});

			if (tmpdir) {
				await tmpdir.cleanup();
			}
		} catch (e: any) {
			log(e.message ? e.message : 'Error occurred', 1);
		}
	}

	log('Processing News Article...', 0);
	const contractId = await createAsset(poolClient, {
		index: { path: 'article.json' },
		paths: (assetId: string) => ({ 'article.json': { id: assetId } }),
		content: finalArticle,
		contentType: CONTENT_TYPES.json,
		artifactType: ArtifactEnum.NewsArticle,
		name: finalArticle.title,
		description: finalArticle.description,
		type: TAGS.values.ansTypes.article,
		additionalMediaPaths: additionalMediaPaths,
		profileImagePath: null,
		associationId: null,
		associationSequence: null,
		childAssets: null,
		renderWith: RENDER_WITH_VALUES,
		assetId: finalArticle.title,
	});

	if (contractId) {
		return contractId;
	}
}
