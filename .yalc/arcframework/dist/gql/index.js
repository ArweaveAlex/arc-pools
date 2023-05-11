"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGQLData = void 0;
const arweave_1 = require("../clients/arweave");
const config_1 = require("../helpers/config");
const types_1 = require("../helpers/types");
const utils_1 = require("../helpers/utils");
async function getGQLData(args) {
    const arClient = new arweave_1.ArweaveClient();
    let nextCursor = null;
    const data = [];
    if (args.ids && args.ids.length <= 0) {
        return { data: data, nextCursor: nextCursor };
    }
    let ids = args.ids ? JSON.stringify(args.ids) : null;
    let tags = args.tagFilters ? (0, utils_1.unquoteJsonKeys)(args.tagFilters) : null;
    let owners = args.uploader ? JSON.stringify([args.uploader]) : null;
    let cursor = args.cursor ? `"${args.cursor}"` : null;
    if (args.reduxCursor && args.cursorObject && args.cursorObject === types_1.CursorEnum.Search) {
        let i;
        if (args.cursor && args.cursor !== config_1.CURSORS.p1 && args.cursor !== config_1.CURSORS.end && !(0, utils_1.checkGqlCursor)(args.cursor)) {
            i = Number(args.cursor.slice(-1));
            cursor = args.cursor;
        }
        else {
            i = 0;
            cursor = `${config_1.SEARCH.cursorPrefix}-${i}`;
        }
    }
    // TODO: reimplement in site
    // if (store.getState().searchIdsReducer[args.reduxCursor][i]) {
    // 	ids = JSON.stringify(store.getState().searchIdsReducer[args.reduxCursor][i][cursor]);
    // 	nextCursor = JSON.parse(ids).length < PAGINATOR ? CURSORS.end : `${SEARCH.cursorPrefix}-${++i}`;
    // }
    const query = {
        query: `
                query {
                    transactions(
                        ids: ${ids},
                        tags: ${tags},
                        owners: ${owners},
                        first: ${config_1.PAGINATOR}, 
                        after: ${cursor}
                    ){
                    edges {
                        cursor
                        node {
                            id
                            tags {
                                name 
                                value 
                            }
                            data {
                                size
                                type
                            }
                        }
                    }
                }
            }
        `,
    };
    const response = await arClient.arweaveGet.api.post('/graphql', query);
    if (response.data.data) {
        const responseData = response.data.data.transactions.edges;
        if (responseData.length > 0) {
            data.push(...responseData);
            if (args.cursorObject && args.cursorObject === types_1.CursorEnum.GQL) {
                if (responseData.length < config_1.PAGINATOR) {
                    nextCursor = config_1.CURSORS.end;
                }
                else {
                    nextCursor = responseData[responseData.length - 1].cursor;
                }
            }
        }
    }
    return { data: data, nextCursor: nextCursor };
}
exports.getGQLData = getGQLData;
__exportStar(require("./artifacts"), exports);
__exportStar(require("./pool"), exports);
__exportStar(require("./pools"), exports);
__exportStar(require("./profile"), exports);
