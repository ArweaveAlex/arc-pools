import { readFileSync } from "fs";

import { ARGS, POOLS_PATH } from "./config";
import { LANGUAGE } from "./language";

const POOLS = JSON.parse(readFileSync(POOLS_PATH).toString());

function createPool() {
    console.log(POOLS);
}

function mineArtifacts() {
    console.log(POOLS);
}

switch (process.argv[2]) {
    case ARGS.createPool:
        createPool();
        break;
    case ARGS.mineArtifacts:
        mineArtifacts();
        break;
    default:
        console.log(LANGUAGE.invalidArgs());
        break;
}