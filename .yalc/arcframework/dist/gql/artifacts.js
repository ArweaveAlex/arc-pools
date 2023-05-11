"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBookmarkIds = exports.getBookmarkIds = exports.getArtifact = exports.getArtifactById = exports.getArtifactsByAssociation = exports.getArtifactsByBookmarks = exports.getArtifactsByIds = exports.getArtifactsByUser = exports.getArtifactsByPool = void 0;
const arweave_1 = require("../clients/arweave");
const config_1 = require("../helpers/config");
const endpoints_1 = require("../helpers/endpoints");
const types_1 = require("../helpers/types");
const utils_1 = require("../helpers/utils");
const pool_1 = require("./pool");
const pools_1 = require("./pools");
const _1 = require(".");
async function getArtifactsByPool(args) {
    let tagFilters = [
        {
            name: config_1.TAGS.keys.poolId,
            values: args.ids,
        },
    ];
    if (args.owner) {
        tagFilters.push({
            name: config_1.TAGS.keys.initialOwner,
            values: [args.owner],
        });
    }
    const gqlResponse = await (0, _1.getGQLData)({
        ids: null,
        tagFilters: tagFilters,
        uploader: args.uploader,
        cursor: args.cursor,
        reduxCursor: args.reduxCursor,
        cursorObject: types_1.CursorEnum.GQL,
    });
    return getArtifactsResponseObject(gqlResponse);
}
exports.getArtifactsByPool = getArtifactsByPool;
async function getArtifactsByUser(args) {
    const poolIds = await (0, pools_1.getPoolIds)();
    const artifacts = await getArtifactsByPool({
        ids: poolIds,
        owner: args.owner,
        uploader: null,
        cursor: args.cursor,
        reduxCursor: args.reduxCursor,
    });
    return artifacts;
}
exports.getArtifactsByUser = getArtifactsByUser;
async function getArtifactsByIds(args) {
    let cursor = null;
    if (args.cursor && args.cursor !== config_1.CURSORS.p1 && args.cursor !== config_1.CURSORS.end && !(0, utils_1.checkGqlCursor)(args.cursor)) {
        cursor = args.cursor;
    }
    const artifacts = await (0, _1.getGQLData)({
        ids: args.ids,
        tagFilters: null,
        uploader: args.uploader,
        cursor: cursor,
        reduxCursor: args.reduxCursor,
        cursorObject: types_1.CursorEnum.Search,
    });
    return getArtifactsResponseObject(artifacts);
}
exports.getArtifactsByIds = getArtifactsByIds;
async function getArtifactsByBookmarks(args) {
    const artifacts = await (0, _1.getGQLData)({
        ids: args.ids,
        tagFilters: null,
        uploader: null,
        cursor: args.cursor,
        reduxCursor: args.reduxCursor,
        cursorObject: types_1.CursorEnum.GQL,
    });
    return getArtifactsResponseObject(artifacts);
}
exports.getArtifactsByBookmarks = getArtifactsByBookmarks;
async function getArtifactsByAssociation(associationId, sequence) {
    const artifacts = [];
    const range = Array.from({ length: sequence.end - sequence.start + 1 }, (_, i) => (i + sequence.start).toString());
    if (associationId) {
        const fullThread = await (0, _1.getGQLData)({
            ids: null,
            tagFilters: [
                {
                    name: config_1.TAGS.keys.associationId,
                    values: [associationId],
                },
            ],
            uploader: null,
            cursor: null,
            reduxCursor: null,
            cursorObject: null,
        });
        const gqlArtifacts = await (0, _1.getGQLData)({
            ids: null,
            tagFilters: [
                {
                    name: config_1.TAGS.keys.associationId,
                    values: [associationId],
                },
                {
                    name: config_1.TAGS.keys.associationSequence,
                    values: range,
                },
            ],
            uploader: null,
            cursor: null,
            reduxCursor: null,
            cursorObject: null,
        });
        const filteredArtifacts = [];
        for (let i = 0; i < gqlArtifacts.data.length; i++) {
            const associationSequence = (0, utils_1.getTagValue)(gqlArtifacts.data[i].node.tags, config_1.TAGS.keys.associationSequence);
            if (!filteredArtifacts.includes(associationSequence)) {
                filteredArtifacts.push(gqlArtifacts.data[i]);
            }
            if (filteredArtifacts.length === range.length) {
                break;
            }
        }
        for (let i = 0; i < filteredArtifacts.length; i++) {
            const artifact = await getArtifact(gqlArtifacts.data[i]);
            if (artifact) {
                artifacts.push(artifact);
            }
        }
        return {
            artifacts: artifacts,
            length: fullThread.data.length,
        };
    }
    else {
        return null;
    }
}
exports.getArtifactsByAssociation = getArtifactsByAssociation;
async function getArtifactById(artifactId) {
    const artifact = await (0, _1.getGQLData)({
        ids: [artifactId],
        tagFilters: null,
        uploader: null,
        cursor: null,
        reduxCursor: null,
        cursorObject: null,
    });
    if (artifact && artifact.data) {
        return await getArtifact(artifact.data[0]);
    }
    else {
        return null;
    }
}
exports.getArtifactById = getArtifactById;
async function getArtifact(artifact) {
    const pool = await (0, pool_1.getPoolById)((0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.poolId));
    try {
        const response = await fetch((0, endpoints_1.getTxEndpoint)(artifact.node.id));
        if (response.status === 200 && artifact) {
            try {
                return {
                    artifactId: artifact.node.id,
                    artifactName: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.artifactName),
                    artifactType: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.artifactType),
                    associationId: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.associationId),
                    associationSequence: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.associationSequence),
                    profileImagePath: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.profileImage),
                    owner: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.initialOwner),
                    ansTitle: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.ansTitle),
                    minted: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.dateCreated),
                    keywords: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.keywords),
                    mediaIds: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.mediaIds),
                    childAssets: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.childAssets),
                    fileType: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.fileType),
                    renderWith: (0, utils_1.getTagValue)(artifact.node.tags, config_1.TAGS.keys.renderWith),
                    poolName: pool ? pool.state.title : null,
                    poolId: pool ? pool.id : null,
                    dataUrl: response.url,
                    dataSize: artifact ? artifact.node.data.size : null,
                    rawData: await response.text(),
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.getArtifact = getArtifact;
async function getBookmarkIds(owner) {
    const gqlData = await (0, _1.getGQLData)({
        ids: null,
        tagFilters: [{ name: config_1.TAGS.keys.bookmarkSearch, values: [owner] }],
        uploader: null,
        cursor: null,
        reduxCursor: null,
        cursorObject: null,
    });
    if (gqlData.data.length > 0) {
        let recentDate = Number((0, utils_1.getTagValue)(gqlData.data[0].node.tags, config_1.TAGS.keys.dateCreated));
        for (let i = 0; i < gqlData.data.length; i++) {
            const date = Number((0, utils_1.getTagValue)(gqlData.data[i].node.tags, config_1.TAGS.keys.dateCreated));
            recentDate = Math.max(recentDate, date);
        }
        for (let i = 0; i < gqlData.data.length; i++) {
            if (recentDate === Number((0, utils_1.getTagValue)(gqlData.data[i].node.tags, config_1.TAGS.keys.dateCreated))) {
                return JSON.parse((0, utils_1.getTagValue)(gqlData.data[i].node.tags, config_1.TAGS.keys.bookmarkIds));
            }
        }
        return [];
    }
    else {
        return [];
    }
}
exports.getBookmarkIds = getBookmarkIds;
async function setBookmarkIds(owner, ids) {
    const arClient = new arweave_1.ArweaveClient();
    let txRes = await arClient.arweavePost.createTransaction({ data: JSON.stringify(ids) }, 'use_wallet');
    txRes.addTag(config_1.TAGS.keys.bookmarkSearch, owner);
    txRes.addTag(config_1.TAGS.keys.dateCreated, Date.now().toString());
    txRes.addTag(config_1.TAGS.keys.bookmarkIds, JSON.stringify(ids));
    // @ts-ignore
    const response = await global.window.arweaveWallet.dispatch(txRes);
    return {
        status: response.id ? 200 : 500,
        message: response.id ? `Bookmarks Updated` : `Error Occurred`,
    };
}
exports.setBookmarkIds = setBookmarkIds;
function getArtifactsResponseObject(gqlResponse) {
    const contracts = gqlResponse.data.filter((element) => {
        return (0, utils_1.getTagValue)(element.node.tags, config_1.TAGS.keys.uploaderTxId) === config_1.STORAGE.none;
    });
    return {
        nextCursor: gqlResponse.nextCursor,
        previousCursor: null,
        contracts: contracts,
    };
}
