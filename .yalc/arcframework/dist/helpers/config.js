"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_POOLS_JSON = exports.DEFAULT_NOSTR_RELAYS = exports.RENDER_WITH_VALUES = exports.STORAGE = exports.FALLBACK_IMAGE = exports.SEARCH = exports.MEDIA_TYPES = exports.CURSORS = exports.PAGINATOR = exports.TAGS = exports.POOL_INDEX_CONTRACT_ID = void 0;
exports.POOL_INDEX_CONTRACT_ID = 'G2j_YAD1GQcdtXZEwUIE7VDs8Y0UuWx85inKI-kXajY';
exports.TAGS = {
    keys: {
        alexPoolId: 'Alex-Pool-Id',
        ansTitle: 'Title',
        ansDescription: 'Description',
        ansTopic: 'Topic',
        ansType: 'Type',
        ansImplements: 'Implements',
        appType: 'App-Type',
        artifactName: 'Artifact-Name',
        artifactType: 'Artifact-Type',
        associationId: 'Association-Id',
        associationSequence: 'Association-Sequence',
        childAssets: 'Child-Assets',
        bookmarkIds: 'Bookmark-Ids-Tag',
        bookmarkSearch: 'Alex-Bookmark-Search',
        dateCreated: 'Date-Created',
        description: 'Description',
        fileType: `File-Type`,
        keywords: 'Keywords',
        initialOwner: 'Initial-Owner',
        poolId: 'Pool-Id',
        poolName: "Pool-Name",
        profileImage: 'Profile-Image',
        protocolName: 'Protocol-Name',
        uploaderTxId: 'Uploader-Tx-Id',
        contractSrc: 'Contract-Src',
        contentType: "Content-Type",
        mediaIds: 'Media-Ids',
        timestamp: 'Timestamp',
        title: 'Title',
        topic: (topic) => `Topic:${topic}`,
        type: "Type",
        collectionName: 'Collection-Name',
        collectionDescription: 'Collection-Description',
        renderWith: 'Render-With',
    },
    values: {
        ansTypes: {
            socialPost: "social-post",
            webPage: "web-page",
            image: "image",
            video: "video",
            music: "music",
            document: "document",
            file: "file",
            collection: "collection"
        },
        audioArtifactType: 'Alex-Audio',
        defaultArtifactType: 'Alex-Default',
        documentArtifactType: 'Alex-Document',
        ebookArtifactType: 'Alex-Ebook',
        imageArtifactType: 'Alex-Image',
        messagingArtifactType: 'Alex-Messaging',
        nostrEventArtifactType: 'Alex-Nostr-Event',
        redditThreadArtifactType: 'Alex-Reddit-Thread',
        webpageArtifactType: 'Alex-Webpage',
        videoArtifactType: 'Alex-Video',
        profileVersions: {
            '0.2': 'Account-0.2',
            '0.3': 'Account-0.3',
        },
        poolVersions: {
            '1.2': 'Alex-Archiving-Pool-v1.2',
            '1.4': 'Alex-Archiving-Pool-v1.4',
            '1.5': 'Alex-Archiving-Pool-v1.5',
        },
        searchIndex: 'Alex-Search-Index-v0',
        collectionAppType: 'Alex-Collection-v0',
        ansVersion: 'ANS-110',
        ansType: 'token',
    },
};
exports.PAGINATOR = 100;
exports.CURSORS = {
    p1: 'P1',
    end: 'END',
};
exports.MEDIA_TYPES = {
    mp4: 'mp4',
    jpg: 'jpg',
    jpeg: 'jpeg',
    png: 'png',
};
exports.SEARCH = {
    cursorPrefix: 'searchCursor',
    idTerm: '`*',
    ownerTerm: '`%',
};
exports.FALLBACK_IMAGE = '8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA';
exports.STORAGE = {
    none: 'N/A',
};
exports.RENDER_WITH_VALUES = ['alex-renderers'];
exports.DEFAULT_NOSTR_RELAYS = [
    { socket: "wss://relay.damus.io" },
    { socket: "wss://nos.lol" },
    { socket: "wss://nostr.relayer.se" },
    { socket: "wss://relay.current.fyi" },
    { socket: "wss://nostr.bitcoiner.social" },
    { socket: "wss://relay.nostr.info" },
    { socket: "wss://nostr.fmt.wiz.biz" }
];
exports.DEFAULT_POOLS_JSON = {
    "appType": exports.TAGS.values.poolVersions["1.5"],
    "contracts": {
        "nft": {
            "id": "",
            "src": ""
        },
        "pool": {
            "id": "",
            "src": ""
        },
    },
    "state": {
        "owner": {
            "pubkey": "",
            "info": ""
        },
        "controller": {
            "pubkey": "",
            "contribPercent": 0
        },
        "title": "Pool Title such as Russia Ukraine War",
        "description": "Paragraph/html markup for long pool description on site",
        "briefDescription": "Text for short pool description on site",
        "image": "",
        "timestamp": "",
        "ownerMaintained": false
    },
    "walletPath": "",
    "keywords": [
        "keyword1",
    ],
    "twitterApiKeys": {
        "consumer_key": "",
        "consumer_secret": "",
        "token": "",
        "token_secret": "",
        "bearer_token": ""
    },
    "clarifaiApiKey": "",
    "topics": [
        "History"
    ],
    "redditApiKeys": {
        "username": "",
        "password": "",
        "appId": "",
        "appSecret": ""
    },
    "nostr": {
        "relays": exports.DEFAULT_NOSTR_RELAYS
    }
};
