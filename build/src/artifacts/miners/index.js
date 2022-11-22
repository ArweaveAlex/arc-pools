"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twitter = exports.processMediaURL = exports.walk = exports.checkPath = void 0;
const p = __importStar(require("path"));
const fs_1 = require("fs");
const fs_2 = require("fs");
const axios_1 = __importDefault(require("axios"));
const checkPath = async (path) => { return fs_1.promises.stat(path).then(_ => true).catch(_ => false); };
exports.checkPath = checkPath;
async function* walk(dir) {
    for await (const d of await fs_1.promises.opendir(dir)) {
        const entry = p.join(dir, d.name);
        if (d.isDirectory())
            yield* await walk(entry);
        else if (d.isFile())
            yield entry;
    }
}
exports.walk = walk;
async function processMediaURL(url, dir, i) {
    return new Promise(async (resolve, reject) => {
        const ext = url?.split("/")?.at(-1)?.split(".")?.at(1)?.split("?").at(0) ?? "unknown";
        const wstream = (0, fs_2.createWriteStream)(p.join(dir, `${i}.${ext}`));
        const res = await axios_1.default.get(url, {
            responseType: "stream"
        }).catch((e) => {
            console.log(`getting ${url} - ${e.message}`);
        });
        if (!res) {
            return;
        }
        await res.data.pipe(wstream); // pipe to file
        wstream.on('finish', () => {
            resolve("done");
        });
        wstream.on('error', (e) => {
            reject(e);
        });
    });
}
exports.processMediaURL = processMediaURL;
exports.twitter = __importStar(require("./twitter"));
