"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PlayIt = void 0;
var node_child_process_1 = require("node:child_process");
var fs_extra_1 = __importDefault(require("fs-extra"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var exit_hook_1 = __importDefault(require("exit-hook"));
var node_os_1 = __importDefault(require("node:os"));
var node_module_1 = require("node:module");
var node_path_1 = require("node:path");
var url_1 = require("url");
var adm_zip_1 = __importDefault(require("adm-zip"));
global.__filename = (0, url_1.fileURLToPath)(String(new Error().stack)
    .replace(/^Error.*\n/, '')
    .split('\n')[0]
    .match(/file:\/\/.*\.[jt]s/)[0]);
global.__dirname = (0, node_path_1.dirname)(__filename);
global.require = (0, node_module_1.createRequire)(__filename);
var PlayIt = /** @class */ (function () {
    function PlayIt() {
        this.destroyed = false;
        this.arch = (function () {
            // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
            if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
                throw new Error("Unsupported Architecture, " + process.arch + "!");
            return process.arch;
        })();
        this.dir = (function () {
            var dir = node_os_1["default"].tmpdir() + "/playit";
            fs_extra_1["default"].mkdirpSync(dir);
            return dir;
        })();
        this.tunnels = [];
        this.agent_key = undefined;
        this.started = false;
        this.playit = undefined;
        this.preferred_tunnel = undefined;
        this.used_packets = 0;
        this.free_packets = 0;
        // Get Os
        this.os = process.platform === 'win32'
            ? 'win'
            : process.platform === 'darwin'
                ? 'mac'
                : 'lin';
        this.version = '0.4.6';
        this.configFile = this.os === 'win'
            ? process.env.AppData + "/playit/config.json"
            : this.os === 'mac'
                ? node_os_1["default"].homedir() + "/Library/Application Support/playit/config.json"
                : node_os_1["default"].homedir() + "/.config/playit/config.json";
        this.downloadUrls = {
            win: "https://playit.gg/downloads/playit-win_64-" + this.version + ".exe",
            lin: "https://playit.gg/downloads/playit-linux_64-" + this.version,
            mac: "https://playit.gg/downloads/playit-darwin_64-" + this.version + ".zip",
            arm: "https://playit.gg/downloads/playit-armv7-" + this.version,
            aarch: "https://playit.gg/downloads/playit-aarch64-" + this.version
        };
        this.binary = undefined;
        this.output = '';
        this.stdout = '';
        this.stderr = '';
        this.onOutput = undefined;
        this.onStdout = undefined;
        this.onStderr = undefined;
        process.chdir(this.dir);
    }
    PlayIt.prototype.disableTunnel = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch("/account/tunnels/" + id + "/disable")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayIt.prototype.enableTunnel = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch("/account/tunnels/" + id + "/enable")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayIt.prototype.createTunnel = function (tunnelOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, proto, _c, port, tunnelId, _d, _e, _f, _g, otherData;
            var _h, _j;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _a = tunnelOpts || {}, _b = _a.proto, proto = _b === void 0 ? 'TCP' : _b, _c = _a.port, port = _c === void 0 ? 80 : _c;
                        _d = this.fetch;
                        _e = ['/account/tunnels'];
                        _h = {
                            method: 'POST'
                        };
                        _g = (_f = JSON).stringify;
                        _j = {
                            id: null,
                            game: "custom-" + proto.toLowerCase(),
                            local_port: Number(port),
                            local_ip: '127.0.0.1',
                            local_proto: proto
                        };
                        return [4 /*yield*/, this.fetch('/account/agents')];
                    case 1: return [4 /*yield*/, (_k.sent()).json()];
                    case 2: return [4 /*yield*/, _d.apply(this, _e.concat([(_h.body = _g.apply(_f, [(_j.agent_id = (_k.sent()).agents.find(function (agent) { return agent.key === _this.agent_key; }).id,
                                    _j.domain_id = null,
                                    _j)]),
                                _h)]))];
                    case 3: return [4 /*yield*/, (_k.sent()).json()];
                    case 4:
                        tunnelId = (_k.sent()).id;
                        return [4 /*yield*/, this.fetch('/account/tunnels')];
                    case 5: return [4 /*yield*/, (_k.sent()).json()];
                    case 6:
                        otherData = (_k.sent()).tunnels.find(function (tunnel) { return tunnel.id === tunnelId; });
                        _k.label = 7;
                    case 7:
                        if (!(otherData.domain_id === null || otherData.connect_address === null)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.fetch('/account/tunnels')];
                    case 8: return [4 /*yield*/, (_k.sent()).json()];
                    case 9:
                        otherData = (_k.sent()).tunnels.find(function (tunnel) { return tunnel.id === tunnelId; });
                        return [3 /*break*/, 7];
                    case 10:
                        otherData.url = otherData.connect_address;
                        this.tunnels.push(otherData);
                        return [2 /*return*/, otherData];
                }
            });
        });
    };
    PlayIt.prototype.claimUrl = function (url) {
        if (url === void 0) { url = isRequired('URL'); }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch(url)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayIt.prototype.create = function (playitOpts) {
        if (playitOpts === void 0) { playitOpts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var outputCallbacks, stderrCallbacks, stdoutCallbacks, _a, dotenvStream, _loop_1, _i, _b, _c, opt, value, _d, _e, _f, _g, _h;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        this.started = true;
                        playitOpts.NO_BROWSER = true;
                        outputCallbacks = [], stderrCallbacks = [], stdoutCallbacks = [];
                        _a = this;
                        return [4 /*yield*/, this.download()];
                    case 1:
                        _a.binary = _j.sent();
                        dotenvStream = fs_extra_1["default"].createWriteStream(this.dir + "/.env", {
                            flags: 'w+'
                        });
                        _loop_1 = function (opt, value) {
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (res, rej) {
                                            return dotenvStream.write(opt + "=" + value + "\n", function (err) {
                                                return err ? rej(err) : res(null);
                                            });
                                        })];
                                    case 1:
                                        _k.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _b = Object.entries(playitOpts);
                        _j.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        _c = _b[_i], opt = _c[0], value = _c[1];
                        return [5 /*yield**/, _loop_1(opt, value)];
                    case 3:
                        _j.sent();
                        _j.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        dotenvStream.end();
                        return [4 /*yield*/, fs_extra_1["default"].pathExists(this.configFile)];
                    case 6:
                        if (!_j.sent()) return [3 /*break*/, 8];
                        return [4 /*yield*/, fs_extra_1["default"].rm(this.configFile)];
                    case 7:
                        _j.sent();
                        _j.label = 8;
                    case 8: return [4 /*yield*/, fs_extra_1["default"].chmod(this.binary, 511)];
                    case 9:
                        _j.sent();
                        // Spawn The PlayIt Binary
                        this.playit = (0, node_child_process_1.spawn)(this.binary, {
                            cwd: this.dir
                        });
                        this.playit.stdout.on('data', function (data) {
                            _this.output += data + "\n";
                            _this.stdout += data + "\n";
                            outputCallbacks.map(function (callback) { return callback(data.toString()); });
                            stdoutCallbacks.map(function (callback) { return callback(data.toString()); });
                        });
                        this.playit.stderr.on('data', function (data) {
                            _this.output += data + "\n";
                            _this.stderr += data + "\n";
                            outputCallbacks.map(function (callback) { return callback(data.toString()); });
                            stderrCallbacks.map(function (callback) { return callback(data.toString()); });
                        });
                        this.onOutput = function (callback) {
                            if (callback === void 0) { callback = function (output) { return output; }; }
                            callback(_this.output);
                            outputCallbacks.push(callback);
                        };
                        this.onStdout = function (callback) {
                            if (callback === void 0) { callback = function (output) { return output; }; }
                            callback(_this.stdout);
                            stdoutCallbacks.push(callback);
                        };
                        this.onStderr = function (callback) {
                            if (callback === void 0) { callback = function (output) { return output; }; }
                            callback(_this.stderr);
                            stderrCallbacks.push(callback);
                        };
                        (0, exit_hook_1["default"])(function () { return _this.stop(); });
                        this.parseOutput();
                        return [4 /*yield*/, new Promise(function (res) {
                                while (!fs_extra_1["default"].pathExistsSync(_this.configFile))
                                    ;
                                res(null);
                            })];
                    case 10:
                        _j.sent();
                        _e = (_d = Object).assign;
                        _f = [this];
                        _h = (_g = JSON).parse;
                        return [4 /*yield*/, fs_extra_1["default"].readFile(this.configFile, 'utf-8')];
                    case 11:
                        _e.apply(_d, _f.concat([_h.apply(_g, [_j.sent()])]));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    PlayIt.prototype.stop = function () {
        this.destroyed = true;
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        fs_extra_1["default"].rmSync(this.binary);
    };
    PlayIt.prototype.download = function (os) {
        if (os === void 0) { os = this.os; }
        return __awaiter(this, void 0, void 0, function () {
            var file, _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        file = this.dir + "/" + require('nanoid').nanoid(20) + "." + (os === 'win' ? 'exe' : os === 'mac' ? 'zip' : 'bin');
                        _b = (_a = fs_extra_1["default"]).writeFile;
                        _c = [file];
                        _e = (_d = Buffer).from;
                        return [4 /*yield*/, (0, node_fetch_1["default"])(this.downloadUrls[os])];
                    case 1: return [4 /*yield*/, (_f.sent()).arrayBuffer()];
                    case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_e.apply(_d, [_f.sent()])]))];
                    case 3:
                        _f.sent();
                        if (os === 'mac') {
                            new adm_zip_1["default"](file)
                                .getEntries()
                                .map(function (file) {
                                return file.entryName.includes('playit') &&
                                    fs_extra_1["default"].writeFileSync(file.entryName.replace('.zip', '.bin'), file.getData());
                            });
                        }
                        return [2 /*return*/, file];
                }
            });
        });
    };
    PlayIt.prototype.parseOutput = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.claimUrl;
                        return [4 /*yield*/, new Promise(function (res) {
                                return _this.onStderr(function (data) {
                                    return data.match(/\bhttps:\/\/[0-9a-z\/]*/gi)
                                        ? res(data.match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
                                        : '';
                                });
                            })];
                    case 1: return [4 /*yield*/, _a.apply(this, [_b.sent()])];
                    case 2:
                        _b.sent();
                        this.onStderr(function (output) {
                            var packetInfo = /INFO Allocator: used packets: [0-9]*, free packets: [0-9]*/.exec(output);
                            if (packetInfo) {
                                _this.used_packets = parseInt(packetInfo[1]);
                                _this.free_packets = parseInt(packetInfo[2]);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayIt.prototype.fetch = function (url, data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(url.startsWith('https://') || url.startsWith('http://'))) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, node_fetch_1["default"])(url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!url.startsWith('/')) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://api.playit.gg" + url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, (0, node_fetch_1["default"])("https://api.playit.gg/" + url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return PlayIt;
}());
exports.PlayIt = PlayIt;
function isRequired(argumentName) {
    // If A Required Argument Isn't Provided, Throw An Error
    throw new TypeError(argumentName + " is a required argument.");
}
function init(playitOpts) {
    if (playitOpts === void 0) { playitOpts = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new PlayIt().create(playitOpts)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports["default"] = init;
