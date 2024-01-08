import minimist from 'minimist';
import * as tApiV2 from 'twitter-api-v2';

import { IPoolClient, PoolClient, PoolConfigType } from 'arcframework';

import { ServiceClient } from '../../clients/service';
import { CLI_ARGS, STREAM_PARAMS } from '../../helpers/config';
import { exitProcess, log, logValue } from '../../helpers/utils';

import { deleteStreamRules, modifyStreamTweet, processIdsV2, processThreadV2 } from '.';

let contentModeration: boolean;

export async function run(poolConfig: PoolConfigType, argv: minimist.ParsedArgs) {
	const poolClient = new PoolClient({ poolConfig });
	const serviceClient: ServiceClient = new ServiceClient(poolConfig);

	if (!serviceClient.twitterV2 || !serviceClient.twitterV2Bearer) {
		exitProcess(`Configure twitter keys`, 1);
	}

	const method = argv['method'];
	const mentionTag = argv['mention-tag'];
	const username = argv['username'];

	contentModeration = argv['content-moderation'];

	switch (method) {
		case undefined:
		case CLI_ARGS.sources.twitter.methods.stream:
			if (!method) {
				log(`Defaulting to stream method ...`, null);
			}
			mineTweetsByStream(poolClient, serviceClient);
			return;
		case CLI_ARGS.sources.twitter.methods.mention:
			if (!mentionTag) {
				exitProcess(`Mention tag not provided`, 1);
			}
			mineTweetsByMention(poolClient, serviceClient, { mentionTag: mentionTag });
			return;
		case CLI_ARGS.sources.twitter.methods.user:
			if (!username) {
				exitProcess(`Username not provided`, 1);
			}
			mineTweetsByUser(poolClient, serviceClient, { username: username });
			return;
		default:
			exitProcess(`Invalid method provided`, 1);
	}
}

async function mineTweetsByStream(poolClient: IPoolClient, serviceClient: ServiceClient) {
	log(`Mining tweets by stream ...`, null);
	let stream: tApiV2.TweetStream;

	try {
		await deleteStreamRules(poolClient, serviceClient);
		stream = serviceClient.twitterV2Bearer.v2.searchStream({ ...STREAM_PARAMS, autoConnect: false });

		const rules = poolClient.poolConfig.keywords.map((keyword: string) => {
			return {
				value: keyword,
				tag: keyword.toLowerCase().replace(/\s/g, ''),
			};
		});

		await serviceClient.twitterV2Bearer.v2.updateStreamRules({
			add: rules,
		});

		await stream.connect({ autoReconnect: false });

		for await (const tweet of stream) {
			await processThreadV2(poolClient, serviceClient, {
				tweet: modifyStreamTweet(tweet),
				contentModeration: contentModeration,
			});
		}
	} catch (e: any) {
		if (stream) stream.close();
		exitProcess('Twitter access failed, check API access level', 1);
	}
}

/*
 * @param mentionTag: string
 */
async function mineTweetsByMention(
	poolClient: IPoolClient,
	serviceClient: ServiceClient,
	args: { mentionTag: string }
) {
	log(`Mining Tweets by mention ...`, null);
	logValue(`Mention Tag`, args.mentionTag, 0);

	try {
		let query = args.mentionTag.includes('@') ? args.mentionTag.replace('@', '') : args.mentionTag;
		let resultSet: any;
		let allTweets: any[] = [];
		do {
			let params: tApiV2.Tweetv2SearchParams = {
				max_results: 100,
				query: query,
				'tweet.fields': ['referenced_tweets'],
			};
			if (resultSet) params.next_token = resultSet.meta.next_token;
			await new Promise((resolve) => setTimeout(resolve, 1000));
			resultSet = await serviceClient.twitterV2.v2.search(query, params);

			if (resultSet.data.data) allTweets = allTweets.concat(resultSet.data.data);
			logValue(`Fetching Ids`, allTweets.length.toString(), 0);
		} while (resultSet.meta.next_token);

		let ids = allTweets
			.map((tweet: any) => {
				if (tweet.referenced_tweets && tweet.referenced_tweets.length > 0) {
					return tweet.referenced_tweets[0].id;
				}
			})
			.filter(function (item, pos, self) {
				return self.indexOf(item) == pos;
			})
			.filter((id) => id !== undefined);

		const batchSize = 500;
		const numBatches = Math.ceil(ids.length / batchSize);

		for (let i = 0; i < numBatches; i++) {
			const batchStart = i * batchSize;
			const batchEnd = (i + 1) * batchSize;
			const batchIds = ids.slice(batchStart, batchEnd);

			await processIdsV2(poolClient, serviceClient, {
				ids: batchIds,
				contentModeration: contentModeration,
			});

			log('Delaying processing ...', 0);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		exitProcess(`Mining complete`, 0);
	} catch (e: any) {
		exitProcess('Twitter access failed, check API access level', 1);
	}
}

/*
 * @param username: string
 */
async function mineTweetsByUser(poolClient: IPoolClient, serviceClient: ServiceClient, args: { username: string }) {
	log(`Mining Tweets by user ...`, null);
	logValue(`User`, args.username, 0);
	let user: any;

	try {
		user = await serviceClient.twitterV2.v2.userByUsername(
			args.username.includes('@') ? args.username.replace('@', '') : args.username
		);
		logValue(`User Id`, user.data.id, 0);

		if (user) {
			const uid = user.data.id;
			let userTimeline: any;
			let allTweets: any[] = [];

			do {
				const params: tApiV2.TweetV2UserTimelineParams = {
					max_results: 100,
				};
				if (userTimeline) params.pagination_token = userTimeline.meta.next_token;

				userTimeline = await serviceClient.twitterV2.v2.userTimeline(uid, params);
				if (userTimeline.data.data) allTweets = allTweets.concat(userTimeline.data.data);
				logValue(`Fetching Ids`, allTweets.length.toString(), 0);
			} while (userTimeline.meta.next_token);

			const ids = allTweets.map((tweet: any) => {
				return tweet.id;
			});

			await processIdsV2(poolClient, serviceClient, {
				ids: ids,
				contentModeration: contentModeration,
			});

			exitProcess(`Mining complete`, 0);
		}
	} catch (e: any) {
		exitProcess('Twitter access failed, check API access level', 1);
	}
}

export async function checkTwitterAccess(poolClient: IPoolClient, serviceClient: ServiceClient) {
	log(`Checking Twitter API access ...`, null);
	let stream: tApiV2.TweetStream;
	try {
		await deleteStreamRules(poolClient, serviceClient);
		stream = serviceClient.twitterV2Bearer.v2.searchStream({ ...STREAM_PARAMS, autoConnect: false });

		if (stream) stream.close();
		log('Twitter mining succeeded', 0);
		return true;
	} catch (e: any) {
		if (stream) stream.close();
		log('Twitter access failed, check API access level', 1);
		return false;
	}
}
