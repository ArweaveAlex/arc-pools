"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const helpers_1 = require("../helpers");
const _1 = require(".");
async function getProfile(walletAddress) {
    if (!walletAddress)
        return null;
    walletAddress = walletAddress.trim();
    if (!/^[a-zA-Z0-9\-_]{43}$/.test(walletAddress))
        return null;
    else {
        let finalProfile = null;
        const gqlResponse = await (0, _1.getGQLData)({
            ids: null,
            tagFilters: [
                {
                    name: helpers_1.TAGS.keys.protocolName,
                    values: [helpers_1.TAGS.values.profileVersions['0.2'], helpers_1.TAGS.values.profileVersions['0.3']],
                },
            ],
            uploader: walletAddress,
            cursor: null,
            reduxCursor: null,
            cursorObject: helpers_1.CursorEnum.GQL,
        });
        if (gqlResponse.data && gqlResponse.data.length) {
            const txResponse = await fetch((0, helpers_1.getTxEndpoint)(gqlResponse.data[0].node.id));
            if (txResponse.status === 200) {
                let fetchedProfile = await txResponse.text();
                fetchedProfile = JSON.parse(fetchedProfile);
                finalProfile = {
                    handle: fetchedProfile.handle ? fetchedProfile.handle : null,
                    avatar: fetchedProfile.avatar ? fetchedProfile.avatar : null,
                    twitter: fetchedProfile.links.twitter ? fetchedProfile.links.twitter : null,
                    discord: fetchedProfile.links.discord ? fetchedProfile.links.discord : null,
                };
            }
        }
        return finalProfile;
    }
}
exports.getProfile = getProfile;
