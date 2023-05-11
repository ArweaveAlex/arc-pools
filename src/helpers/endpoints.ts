import { TWEET_FIELDS } from "./config";

export const contractEndpoint = (txId: string) => `https://gateway.redstone.finance/gateway/contract?txId=${txId}`;
export const conversationEndpoint = (conversationId: string, paginationToken: string | null) => {
    let paginationString: string;
    if (paginationToken) {
        paginationString = `&next_token=${paginationToken}`;
    }
    else {
        paginationString = "";
    }
    return (
        `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${conversationId}&tweet.fields=${TWEET_FIELDS.map((field: any) => field)}&max_results=100${paginationString}`
    )
};
export const wikiApiEndpoint = `https://wikipedia.org/w/api.php`;

export function getTxEndpoint(txId: string) {
    return `https://arweave.net/${txId}`;
}

export function getRedstoneSrcTxEndpoint(src: string, page: any) {
    return `https://gateway.redstone.finance/gateway/contracts-by-source?id=${src}&page=${page}&sort=asc`;
}