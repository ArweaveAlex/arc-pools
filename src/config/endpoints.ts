import { TWEET_FIELDS } from ".";

export const contractEndpoint = (txId: string) => `https://gateway.redstone.finance/gateway/contract?txId=${txId}`;
export const sonarLink = (contractId: string) => `https://sonar.warp.cc/#/app/contract/${contractId}`;
export const conversationEndpoint = (conversationId: string) => `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${conversationId}&tweet.fields=${TWEET_FIELDS.map((field: any) => field)}&max_results=100`;