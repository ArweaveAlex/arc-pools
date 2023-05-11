export declare function initSearch(poolIds: string[]): Promise<string[]>;
export declare function runSearch(searchTerm: string, poolIndeces: string[] | null, owner: string | null, callback: (ids: string[], checkProcessed: any) => void): Promise<void>;
