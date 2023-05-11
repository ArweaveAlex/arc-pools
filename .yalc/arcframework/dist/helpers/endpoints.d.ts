export declare function getBalanceEndpoint(wallet: string): string;
export declare function getViewblockEndpoint(txId: string): string;
export declare function getTxEndpoint(txId: string): string;
export declare function getRedstoneSrcTxEndpoint(contractId: string, page: number): string;
export declare function getRedstoneDescEndpoint(src: string, page: number, limit: number): string;
export declare function getRendererEndpoint(renderWith: string, tx: string): string;
export declare const sonarLink: (contractId: string) => string;
