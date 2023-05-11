import Bundlr from "@bundlr-network/client/build/cjs/common/bundlr";
import { Contract } from "warp-contracts";
export declare enum ArtifactEnum {
    Image = "Alex-Image",
    Messaging = "Alex-Messaging",
    Nostr = "Alex-Nostr-Event",
    Reddit = "Alex-Reddit-Thread",
    Webpage = "Alex-Webpage",
    Document = "Alex-Document",
    Audio = "Alex-Audio",
    Video = "Alex-Video",
    Ebook = "Alex-Ebook",
    File = "Alex-File"
}
export declare enum CursorEnum {
    GQL = "gql",
    Search = "search"
}
export declare enum ANSTopicEnum {
    History = "History",
    Philosophy = "Philosophy",
    International = "International",
    Culture = "Culture",
    Art = "Art",
    Music = "Music",
    Faith = "Faith",
    Spirituality = "Spirituality",
    Sports = "Sports",
    Business = "Business",
    Technology = "Technology",
    Politics = "Politics",
    Other = "Other"
}
export type GQLResponseType = {
    cursor: string | null;
    node: {
        id: string;
        tags: {
            [key: string]: any;
        }[];
        data: {
            size: string;
            type: string;
        };
    };
};
export type ArcGQLResponseType = {
    data: GQLResponseType[];
    nextCursor: string | null;
};
export interface ArtifactDetailType {
    artifactId: string | null;
    artifactName: string | null;
    artifactType: ArtifactEnum;
    associationId: string | null;
    associationSequence: string | null;
    profileImagePath: string | null;
    owner: string | null;
    ansTitle: string | null;
    minted: string | null;
    keywords: string | null;
    poolName: string | null;
    mediaIds: string | null;
    childAssets: string | null;
    fileType: string | null;
    renderWith: string | null;
    poolId: string | null;
    dataUrl: string | null;
    dataSize: string | null;
    rawData: string | null;
}
export interface AssociationDetailType {
    artifacts: ArtifactDetailType[];
    length: number;
}
export type ArtifactArgsType = {
    ids: string[] | null;
    owner: string | null;
    uploader: string | null;
    cursor: string | null;
    reduxCursor: string | null;
};
export type ArtifactResponseType = {
    nextCursor: string | null;
    previousCursor: string | null;
    contracts: GQLResponseType[];
};
export interface PoolType {
    id: string;
    state: PoolStateType;
}
export interface PoolStateType {
    title: string;
    image: string;
    briefDescription: string;
    description: string;
    owner: string;
    ownerInfo: string;
    timestamp: string;
    contributors: {
        [key: string]: string;
    };
    tokens: {
        [key: string]: string;
    };
    totalContributions: string;
    totalSupply: string;
    balance: string;
    ownerMaintained?: boolean;
    controlPubkey?: string;
    contribPercent?: string;
    canEvolve?: boolean;
    topics?: string[];
}
export interface CollectionType {
    id: string;
    state: CollectionStateType;
}
export interface CollectionStateType {
    ids: string[];
    title: string;
    topic: string;
    name: string;
    ticker: string;
    balances: any;
    maxSupply: number;
    transferable: boolean;
    owner: string;
    phase: string;
    description: string;
    timestamp: string;
    lockTime: number;
    lastTransferTimestamp: string;
}
export interface PoolSearchIndexType {
    id: string;
    state: PoolSearchIndexStateType;
}
export interface PoolSearchIndexStateType {
    canEvolve: boolean;
    owner: string;
    searchIndeces: string[];
}
export type ContributionResultType = {
    status: boolean;
    message: string | null;
};
export type DateType = 'iso' | 'epoch';
export type CursorType = {
    next: string | null;
    previous: string | null;
};
export type ValidationType = {
    status: boolean;
    message: string | null;
};
export type NotificationResponseType = {
    status: number | null;
    message: string | null;
};
export type TableIdType = {
    value: string;
    type: 'poolId' | 'ownerId';
};
export type TagFilterType = {
    name: string;
    values: string[];
};
export type ContributionType = {
    timestamp: string;
    qty: string;
};
export type PoolFilterType = {
    title: string;
    fn: (data: any) => any;
};
export type CursorObjectKeyType = CursorEnum.GQL | CursorEnum.Search | null;
export type CursorObjectType = {
    key: CursorObjectKeyType;
    value: string;
};
export type SequenceType = {
    start: number;
    end: number;
};
export type ProfileType = {
    handle: string | null;
    avatar: string | null;
    twitter: string | null;
    discord: string | null;
};
export type PoolConfigType = {
    appType: string;
    contracts: {
        nft: {
            id: NStringType;
            src: NStringType;
        };
        pool: {
            id: NStringType;
            src: NStringType;
        };
    };
    state: {
        owner: {
            pubkey: string;
            info: string;
        };
        controller: {
            pubkey: NStringType;
            contribPercent: number | null;
        };
        title: string;
        description: string;
        briefDescription: string;
        image: NStringType;
        timestamp: NStringType;
    };
    walletPath?: string;
    walletKey: string;
    keywords: string[];
    twitterApiKeys: any;
    clarifaiApiKey: string;
    topics: string[];
    redditApiKeys: any;
    nostr: {
        relays: NostrRelayType[];
    };
};
export type NostrRelayType = {
    socket: string;
};
type NStringType = string | null;
export type KeyValueType = {
    [key: string]: string;
};
export interface PoolType {
    id: string;
    state: PoolStateType;
}
export interface IPoolClient {
    arClient: any;
    poolConfig: PoolConfigType;
    walletKey: string | null;
    bundlr: Bundlr;
    contract: Contract;
    warp: any;
}
export {};
