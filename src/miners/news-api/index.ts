import { Readability } from '@mozilla/readability';
import { ArtifactEnum, CONTENT_TYPES, createAsset, IPoolClient, log, RENDER_WITH_VALUES, TAGS } from 'arcframework';
import { mkdir } from 'fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import * as path from 'path';
import tmp from 'tmp-promise';

import { NewsApiArticleType } from '../../helpers/types';
import { checkPath, processMediaPaths, processMediaURL } from '../../helpers/utils';

export async function processArticles(
    poolClient: IPoolClient,
    args: {
        articles: NewsApiArticleType[]
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
            }
            catch (e: any) {
                console.error(e);
            }
		} else {
			log(`Duplicate artifact skipping...`, null);
		}
	}
}

async function processArticle(
    poolClient: IPoolClient,
    args: {
        article: NewsApiArticleType
    }
) {
    let finalArticle = { ...args.article };

    const tmpdir = await tmp.dir({ unsafeCleanup: true });
    const htmlResult: any = await fetch(args.article.url)
    const htmlContent = await htmlResult.text();
    
    try {
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console, { omitJSDOMErrors: true });
        const dom = new JSDOM(htmlContent, {
            url: finalArticle.url,
            virtualConsole: virtualConsole,
        });
    
        const rawHtml = new Readability(dom.window.document).parse();
        if (rawHtml && rawHtml.textContent) {
            finalArticle.content = formatArticleContent(rawHtml.textContent)
        }
    }
    catch (e: any) {
        console.error(e);
    }

    let additionalMediaPaths: any = null;
    if (finalArticle.urlToImage) {
        try {
            const mediaDir = path.join(tmpdir.path, 'media');

            if (!(await checkPath(mediaDir))) {
                await mkdir(mediaDir);
            }
    
            await processMediaURL(finalArticle.urlToImage, mediaDir, 0);
    
            additionalMediaPaths = await processMediaPaths(poolClient, {
                subTags: [],
                tmpdir: tmpdir,
                path: 'media',
            });
    
            if (tmpdir) {
                await tmpdir.cleanup();
            }
        }
        catch (e: any) {
            console.error(e);
        }
    }

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

function formatArticleContent(content: string) {
    return content
        .replace(/\n|\t/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\.(?=\w)/g, '.<br>');
}