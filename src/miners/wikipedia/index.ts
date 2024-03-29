import fs from 'fs';
import WikiJS from 'wikijs';

import { ArtifactEnum, CONTENT_TYPES, IPoolClient, RENDER_WITH_VALUE, TAGS } from 'arcframework';

import { wikiApiEndpoint } from '../../helpers/endpoints';
import { log, logValue } from '../../helpers/utils';

let currentArticleUrl = '';

import { createAsset } from '../../api';
export async function processWikipedia(poolClient: IPoolClient) {
	let articles = [];
	for (let i = 0; i < poolClient.poolConfig.keywords.length; i++) {
		let a = await WikiJS({
			apiUrl: wikiApiEndpoint,
			origin: null,
		}).search(poolClient.poolConfig.keywords[i]);
		articles = articles.concat(a.results);
	}

	articles = articles.filter(onlyUnique);

	// let sentList = [];
	// if (!fs.existsSync('data')) {
	// 	fs.mkdirSync('data');
	// }
	// if (!fs.existsSync('data/wikiarticlessent.txt')) {
	// 	fs.writeFileSync('data/wikiarticlessent.txt', '');
	// }
	// sentList = fs.readFileSync('data/wikiarticlessent.txt').toString().split('\n');

	logValue(`Wikipedia Page Count`, articles.length.toString(), 0);
	for (let i = 0; i < articles.length; i++) {
		// if (!sentList.includes(articles[i])) {
		await processPage(poolClient, articles[i]);
		// fs.appendFileSync('data/wikiarticlessent.txt', articles[i] + '\n');
		// }
	}
	log(`Wikipedia Mining Complete`, 0);
}

function onlyUnique(value: any, index: any, self: any) {
	return self.indexOf(value) === index;
}

const getPage = async (query: string) => {
	let content: any;

	await WikiJS({ apiUrl: wikiApiEndpoint })
		.page(query)
		.then((page) => page)
		.then((obj) => (content = obj));

	return content;
};

function replacer(match: string, p1: string, _offset: number, _string: string) {
	return match.replace('#' + p1, currentArticleUrl + '#' + p1).replace('<a', '<a target="_blank"');
}

export const parseHTML = (content: any, title: any) => {
	var find = '<a href="/wiki';
	var re = new RegExp(find, 'g');
	var replace = '<a target="_blank" href="https://wikipedia.org/wiki';
	let finalHtml = content.replace(re, replace);

	var find2 = '<a href="#cite_note';
	var re2 = new RegExp(find2, 'g');
	var replace2 = '<a target="_blank" href="' + currentArticleUrl + '#cite_note';
	finalHtml = finalHtml.replace(re2, replace2);

	var find3 = '<a href="#cite_ref';
	var re3 = new RegExp(find3, 'g');
	var replace3 = '<a target="_blank" href="' + currentArticleUrl + '#cite_ref';
	finalHtml = finalHtml.replace(re3, replace3);

	let head =
		'<html><head><link rel="stylesheet" href="https://arweave.net/zeD-oNKfwNXE4k4-QeCAR3UZIfLXA7ettyi8qGZqd7g"><title>' +
		title +
		'</title><meta charset="UTF-8"><meta name="description" content="' +
		title +
		' Permaweb Page"></head><body>';
	finalHtml = head + finalHtml;
	finalHtml = finalHtml + '</body></html>';

	let tocReg = new RegExp('<a href="#' + '(.*)' + '"><span class="tocnumber">', 'g');
	finalHtml = finalHtml.replace(tocReg, replacer);

	return finalHtml;
};

const processPage = async (poolClient: IPoolClient, query: string) => {
	try {
		const content = await getPage(query);
		currentArticleUrl = content.url();
		const html = parseHTML(await content.html(), content.title);
		await content.categories();

		const isDup = await poolClient.arClient.isDuplicate({
			artifactName: `${content.title} Wikipedia Page`,
			poolId: poolClient.poolConfig.contracts.pool.id,
		});

		if (!isDup) {
			try {
				log('Processing Wikipedia Page...', 0);
				await createAsset(poolClient, {
					index: { path: 'index.html' },
					paths: (assetId: string) => ({ 'index.html': { id: assetId } }),
					content: html,
					contentType: CONTENT_TYPES.textHtml,
					artifactType: ArtifactEnum.Webpage,
					name: `${content.title} Wikipedia Page`,
					description: `${content.title} Wikipedia Page`,
					type: TAGS.values.ansTypes.webPage,
					additionalMediaPaths: null,
					profileImagePath: null,
					associationId: null,
					associationSequence: null,
					childAssets: null,
					renderWith: RENDER_WITH_VALUE,
					assetId: content.title,
					originalUrl: currentArticleUrl ? currentArticleUrl : null,
				});
			} catch (e: any) {
				console.error(e.message);
			}
		} else {
			log(`Skipping duplicate artifact...`, null);
			await new Promise((r) => setTimeout(r, 500));
		}
	} catch (e: any) {
		console.error(e.message);
	}
};
