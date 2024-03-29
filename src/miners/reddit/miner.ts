import minimist from 'minimist';

import { IPoolClient, PoolClient, PoolConfigType } from 'arcframework';

import { ServiceClient } from '../../clients/service';
import { CLI_ARGS } from '../../helpers/config';
import { exitProcess, log } from '../../helpers/utils';

import { processPosts } from '.';

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
	const poolClient = new PoolClient({ poolConfig });
	const serviceClient = new ServiceClient(poolConfig);

	log(`Mining Reddit...`, 0);

	const method = argv['method'];
	const subreddit = argv['subreddit'];
	const username = argv['username'];
	const searchTerm = argv['search-term'];

	switch (method) {
		case CLI_ARGS.sources.reddit.methods.subreddit:
			if (!subreddit) {
				exitProcess(`Subreddit not provided`, 1);
			}
			await minePostsBySubreddit(poolClient, serviceClient, { subreddit: subreddit });
			break;
		case CLI_ARGS.sources.reddit.methods.user:
			if (!username) {
				exitProcess(`Username not provided`, 1);
			}
			await minePostsByUser(poolClient, serviceClient, { username: username });
			break;
		case CLI_ARGS.sources.reddit.methods.search:
			if (!searchTerm) {
				exitProcess(`Search term not provided`, 1);
			}
			await minePostsBySearch(poolClient, serviceClient, { searchTerm: searchTerm });
			break;
		default:
			exitProcess(`Invalid method provided`, 1);
	}

	log(`Reddit Mining Complete`, 0);
}

async function minePostsBySearch(poolClient: IPoolClient, serviceClient: ServiceClient, args: { searchTerm: string }) {
	let url = `/r/all/search`;
	let additionalParams = { q: args.searchTerm };
	await minePosts(poolClient, serviceClient, additionalParams, url);
}

async function minePostsBySubreddit(
	poolClient: IPoolClient,
	serviceClient: ServiceClient,
	args: { subreddit: string }
) {
	let url = `/r/${args.subreddit}/new.json`;
	console.log(url);
	await minePosts(poolClient, serviceClient, {}, url);
}

async function minePostsByUser(poolClient: IPoolClient, serviceClient: ServiceClient, args: { username: string }) {
	let url = `/user/${args.username}/submitted.json`;
	await minePosts(poolClient, serviceClient, {}, url);
}

async function minePosts(poolClient: IPoolClient, serviceClient: ServiceClient, additionalParams: any, url: string) {
	try {
		let cursor = null;
		do {
			await new Promise((r) => setTimeout(r, 2000));

			let posts = await serviceClient.reddit.get(url, {
				...additionalParams,
				...{
					limit: 100,
					after: cursor,
					sort: 'new',
				},
			});

			cursor = posts.data.after;

			await processPosts(poolClient, serviceClient, { posts: posts.data.children, contentModeration: false });
		} while (cursor != null);
	} catch (e: any) {
		log(e.message ? e.message : 'Error occurred', 1);
	}
}
