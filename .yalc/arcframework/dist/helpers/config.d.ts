export declare const POOL_INDEX_CONTRACT_ID = "G2j_YAD1GQcdtXZEwUIE7VDs8Y0UuWx85inKI-kXajY";
export declare const TAGS: {
    keys: {
        alexPoolId: string;
        ansTitle: string;
        ansDescription: string;
        ansTopic: string;
        ansType: string;
        ansImplements: string;
        appType: string;
        artifactName: string;
        artifactType: string;
        associationId: string;
        associationSequence: string;
        childAssets: string;
        bookmarkIds: string;
        bookmarkSearch: string;
        dateCreated: string;
        description: string;
        fileType: string;
        keywords: string;
        initialOwner: string;
        poolId: string;
        poolName: string;
        profileImage: string;
        protocolName: string;
        uploaderTxId: string;
        contractSrc: string;
        contentType: string;
        mediaIds: string;
        timestamp: string;
        title: string;
        topic: (topic: string) => string;
        type: string;
        collectionName: string;
        collectionDescription: string;
        renderWith: string;
    };
    values: {
        ansTypes: {
            socialPost: string;
            webPage: string;
            image: string;
            video: string;
            music: string;
            document: string;
            file: string;
            collection: string;
        };
        audioArtifactType: string;
        defaultArtifactType: string;
        documentArtifactType: string;
        ebookArtifactType: string;
        imageArtifactType: string;
        messagingArtifactType: string;
        nostrEventArtifactType: string;
        redditThreadArtifactType: string;
        webpageArtifactType: string;
        videoArtifactType: string;
        profileVersions: {
            '0.2': string;
            '0.3': string;
        };
        poolVersions: {
            '1.2': string;
            '1.4': string;
            '1.5': string;
        };
        searchIndex: string;
        collectionAppType: string;
        ansVersion: string;
        ansType: string;
    };
};
export declare const PAGINATOR = 100;
export declare const CURSORS: {
    p1: string;
    end: string;
};
export declare const MEDIA_TYPES: {
    mp4: string;
    jpg: string;
    jpeg: string;
    png: string;
};
export declare const SEARCH: {
    cursorPrefix: string;
    idTerm: string;
    ownerTerm: string;
};
export declare const FALLBACK_IMAGE = "8HqSqy_nNRSTPv-q-j7_iHGTp6lEA5K77TP4BPuXGyA";
export declare const STORAGE: {
    none: string;
};
export declare const RENDER_WITH_VALUES: string[];
export declare const DEFAULT_NOSTR_RELAYS: {
    socket: string;
}[];
export declare const DEFAULT_POOLS_JSON: {
    appType: string;
    contracts: {
        nft: {
            id: string;
            src: string;
        };
        pool: {
            id: string;
            src: string;
        };
    };
    state: {
        owner: {
            pubkey: string;
            info: string;
        };
        controller: {
            pubkey: string;
            contribPercent: number;
        };
        title: string;
        description: string;
        briefDescription: string;
        image: string;
        timestamp: string;
        ownerMaintained: boolean;
    };
    walletPath: string;
    keywords: string[];
    twitterApiKeys: {
        consumer_key: string;
        consumer_secret: string;
        token: string;
        token_secret: string;
        bearer_token: string;
    };
    clarifaiApiKey: string;
    topics: string[];
    redditApiKeys: {
        username: string;
        password: string;
        appId: string;
        appSecret: string;
    };
    nostr: {
        relays: {
            socket: string;
        }[];
    };
};
