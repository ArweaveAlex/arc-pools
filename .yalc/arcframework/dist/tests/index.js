"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gql_1 = require("../gql");
async function testGetArtifactsByPoolGQL() {
    console.log(`Testing Artifacts By Pool GQL Request ...`);
    const gqlData = await (0, gql_1.getArtifactsByPool)({
        ids: ['zoljIRyzG5hp-R4EZV2q8kFI49OAoy23_B9YJ_yEEws'],
        owner: null,
        uploader: null,
        cursor: null,
        reduxCursor: 'poolAll',
    });
    console.log({
        contracts: gqlData.contracts.length,
        nextCursor: gqlData.nextCursor,
        previousCursor: gqlData.previousCursor,
    });
}
async function testGetArtifactsByUserGQL() {
    console.log(`Testing Artifacts By User GQL Request ...`);
    const gqlData = await (0, gql_1.getArtifactsByUser)({
        ids: null,
        owner: 'uf_FqRvLqjnFMc8ZzGkF4qWKuNmUIQcYP0tPlCGORQk',
        uploader: null,
        cursor: null,
        reduxCursor: 'accountAll',
    });
    console.log({
        contracts: gqlData.contracts.length,
        nextCursor: gqlData.nextCursor,
        previousCursor: gqlData.previousCursor,
    });
}
async function testGetArtifactsByIdsGQL() {
    console.log(`Testing Artifacts By Ids GQL Request ...`);
    const gqlData = await (0, gql_1.getArtifactsByIds)({
        ids: [
            'lFO2qdhjBpMG13-Zamz3vW7E7FFbJT9NgPhgdgDUVQc',
            '6R2dVcktecT0dbezgHq8eHrmzRpnl8JrtaDXT-ZZ69s',
            '9hUxb7MCMmMJ61oWJAKbGMczUDVYvPjmLs_xSLsppF4',
            'FRRpmc0_e4--5c_Lsg9yNpqsu9aIQLg920GUKo6JjPo',
            'PsNTVxx6LauegIamlK4ju92-noWpFxc8fTTmtiEHuAU',
            'qERJuxaUy2Vs9VwjCZSu5Lt0Tk1ssox2o0hRlHb7WkY',
        ],
        owner: null,
        uploader: null,
        cursor: null,
        reduxCursor: null,
    });
    console.log({
        contracts: gqlData.contracts.length,
        nextCursor: gqlData.nextCursor,
        previousCursor: gqlData.previousCursor,
    });
}
async function testGetArtifactsByBookmarksGQL() {
    console.log(`Testing Artifacts By Ids GQL Request ...`);
    const gqlData = await (0, gql_1.getArtifactsByBookmarks)({
        ids: ['8VUccSZEcXxnHh5o6L7VkzY__hNDyRM0Er8c3RmCMJc'],
        owner: null,
        uploader: null,
        cursor: null,
        reduxCursor: null,
    });
    console.log({
        contracts: gqlData.contracts.length,
        nextCursor: gqlData.nextCursor,
        previousCursor: gqlData.previousCursor,
    });
}
async function testGetPoolsGQL() {
    console.log(`Testing Pools GQL Request ...`);
    const pools = await (0, gql_1.getPools)();
    console.log(`Pool Count: ${pools.length}`);
}
async function testGetProfileGQL() {
    console.log(`Testing Profile GQL Request ...`);
    const profile = await (0, gql_1.getProfile)('uf_FqRvLqjnFMc8ZzGkF4qWKuNmUIQcYP0tPlCGORQk');
    console.log(profile);
}
(async function () {
    switch (process.argv[2]) {
        case 'get-artifacts-by-pool':
            await testGetArtifactsByPoolGQL();
            return;
        case 'get-artifacts-by-user':
            await testGetArtifactsByUserGQL();
            return;
        case 'get-artifacts-by-ids':
            await testGetArtifactsByIdsGQL();
            return;
        case 'get-artifacts-by-bookmarks':
            await testGetArtifactsByBookmarksGQL();
            return;
        case 'get-pools':
            await testGetPoolsGQL();
            return;
        case 'get-profile':
            await testGetProfileGQL();
            return;
        case 'full':
            await testGetArtifactsByPoolGQL();
            await testGetArtifactsByUserGQL();
            await testGetArtifactsByIdsGQL();
            await testGetArtifactsByBookmarksGQL();
            await testGetPoolsGQL();
            await testGetProfileGQL();
            return;
        default:
            return;
    }
})();
