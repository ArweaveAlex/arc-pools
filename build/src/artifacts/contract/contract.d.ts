export declare function handle(state: any, action: any): {
    state: any;
    result?: undefined;
} | {
    result: {
        target: any;
        ticker: any;
        balance: number;
        intBalance: any;
    };
    state?: undefined;
};
