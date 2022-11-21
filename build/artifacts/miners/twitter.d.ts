/**
 * Start a twitter stream, aggregate them into a list
 * then mine them onto Arweave synchronously so if it
 * fails in the middle we don't end up with partial
 * atomic assets
 * @param poolSlug
 */
export declare function mineTweets(poolSlug: string): Promise<void>;
/**
 * If someone sais @thealexarchive #crypto etc...
 * this will grab those and mine them to the pool
 * @param poolSlug
 */
export declare function mineTweetsByMention(poolSlug: string, mentionTag: string): Promise<void>;
/**
 * mine all of a specific users tweets
 * ignoring duplicates
 * @param poolSlug
 */
export declare function mineTweetsByUser(poolSlug: string, userName: string): Promise<void>;
