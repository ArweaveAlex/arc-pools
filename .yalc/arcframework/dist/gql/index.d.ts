import { CursorObjectKeyType, GQLResponseType, TagFilterType } from '../helpers/types';
export declare function getGQLData(args: {
    ids: string[] | null;
    tagFilters: TagFilterType[] | null;
    uploader: string | null;
    cursor: string | null;
    reduxCursor: string | null;
    cursorObject: CursorObjectKeyType;
}): Promise<{
    data: GQLResponseType[];
    nextCursor: string | null;
}>;
export * from './artifacts';
export * from './pool';
export * from './pools';
export * from './profile';
