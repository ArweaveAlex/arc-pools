import { TWEET_FIELDS } from './config';

export const conversationEndpoint = (conversationId: string, paginationToken: string | null) => {
	let paginationString: string;
	if (paginationToken) {
		paginationString = `&next_token=${paginationToken}`;
	} else {
		paginationString = '';
	}
	return `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${conversationId}&tweet.fields=${TWEET_FIELDS.map(
		(field: any) => field
	)}&max_results=100${paginationString}`;
};

export const wikiApiEndpoint = `https://wikipedia.org/w/api.php`;

export const newsApiEndpoint = (query: string, apiKey: string, page: number) => {
	return `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&page=${page}`;
}