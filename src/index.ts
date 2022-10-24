import { ARGS } from "./config";
import { LANGUAGE } from "./language";

function createPool() {
    console.log("Create Pool");
}

function mineArtifacts() {
    console.log("Mine Artifacts");
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