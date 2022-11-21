import { PathLike } from "fs";
export declare const checkPath: (path: PathLike) => Promise<boolean>;
export declare function walk(dir: string): any;
export declare function processMediaURL(url: string, dir: string, i: number): Promise<unknown>;
export * as twitter from './twitter';
