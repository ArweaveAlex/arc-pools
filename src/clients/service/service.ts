import * as tApiV2 from 'twitter-api-v2';
const Reddit = require('reddit');

import { PoolConfigType } from 'arcframework';

import { log } from '../../helpers/utils';

export default class ServiceClient {
	twitterV2: tApiV2.TwitterApi;
	twitterV2Bearer: tApiV2.TwitterApi;

	reddit: any;

	constructor(poolConfig: PoolConfigType) {
		try {
			this.twitterV2 = new tApiV2.TwitterApi({
				appKey: poolConfig.twitterApiKeys.consumer_key,
				appSecret: poolConfig.twitterApiKeys.consumer_secret,
				accessToken: poolConfig.twitterApiKeys.token,
				accessSecret: poolConfig.twitterApiKeys.token_secret,
			});
			this.twitterV2Bearer = new tApiV2.TwitterApi(poolConfig.twitterApiKeys.bearer_token);
		} catch (e: any) {
			log('Twitter keys invalid, twitter mining unavailable, ignore this if you are not mining twitter', 1);
		}

		this.reddit = new Reddit({
			username: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.username : '',
			password: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.password : '',
			appId: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.appId : '',
			appSecret: poolConfig.redditApiKeys ? poolConfig.redditApiKeys.appSecret : '',
			userAgent: 'Alex/1.0.0 (http://alex.arweave.dev)',
		});
	}
}
