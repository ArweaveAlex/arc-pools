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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.twitter = exports.processMediaURL = exports.walk = exports.checkPath = void 0;
var p = __importStar(require("path"));
var fs_1 = require("fs");
var fs_2 = require("fs");
var axios_1 = __importDefault(require("axios"));
var checkPath = function (path) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, fs_1.promises.stat(path).then(function (_) { return true; })["catch"](function (_) { return false; })];
}); }); };
exports.checkPath = checkPath;
function walk(dir) {
    return __asyncGenerator(this, arguments, function walk_1() {
        var _a, _b, _c, d, entry, e_1_1;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 15, 16, 21]);
                    _a = true;
                    return [4 /*yield*/, __await(fs_1.promises.opendir(dir))];
                case 1:
                    _b = __asyncValues.apply(void 0, [_g.sent()]);
                    _g.label = 2;
                case 2: return [4 /*yield*/, __await(_b.next())];
                case 3:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 14];
                    _f = _c.value;
                    _a = false;
                    _g.label = 4;
                case 4:
                    _g.trys.push([4, , 12, 13]);
                    d = _f;
                    entry = p.join(dir, d.name);
                    if (!d.isDirectory()) return [3 /*break*/, 8];
                    return [4 /*yield*/, __await(walk(entry))];
                case 5: return [5 /*yield**/, __values(__asyncDelegator.apply(void 0, [__asyncValues.apply(void 0, [_g.sent()])]))];
                case 6: return [4 /*yield*/, __await.apply(void 0, [_g.sent()])];
                case 7:
                    _g.sent();
                    return [3 /*break*/, 11];
                case 8:
                    if (!d.isFile()) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await(entry)];
                case 9: return [4 /*yield*/, _g.sent()];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    _a = true;
                    return [7 /*endfinally*/];
                case 13: return [3 /*break*/, 2];
                case 14: return [3 /*break*/, 21];
                case 15:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 21];
                case 16:
                    _g.trys.push([16, , 19, 20]);
                    if (!(!_a && !_d && (_e = _b["return"]))) return [3 /*break*/, 18];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 17:
                    _g.sent();
                    _g.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
}
exports.walk = walk;
function processMediaURL(url, dir, i) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var ext, wstream, res;
                    var _a, _b, _c, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                ext = (_e = (_d = (_c = (_b = (_a = url === null || url === void 0 ? void 0 : url.split("/")) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.split(".")) === null || _c === void 0 ? void 0 : _c.at(1)) === null || _d === void 0 ? void 0 : _d.split("?").at(0)) !== null && _e !== void 0 ? _e : "unknown";
                                wstream = (0, fs_2.createWriteStream)(p.join(dir, "".concat(i, ".").concat(ext)));
                                return [4 /*yield*/, axios_1["default"].get(url, {
                                        responseType: "stream"
                                    })["catch"](function (e) {
                                        console.log("getting ".concat(url, " - ").concat(e.message));
                                    })];
                            case 1:
                                res = _f.sent();
                                if (!res) {
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, res.data.pipe(wstream)]; // pipe to file
                            case 2:
                                _f.sent(); // pipe to file
                                wstream.on('finish', function () {
                                    resolve("done");
                                });
                                wstream.on('error', function (e) {
                                    reject(e);
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.processMediaURL = processMediaURL;
exports.twitter = __importStar(require("./twitter"));
