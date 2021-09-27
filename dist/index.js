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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PlayIt = void 0;
var child_process_1 = require("child_process");
var fs_extra_1 = __importDefault(require("fs-extra"));
var make_fetch_happen_1 = __importDefault(require("make-fetch-happen"));
var os_1 = __importDefault(require("os"));
var unzipper_1 = __importDefault(require("unzipper"));
/**  @class */
var PlayIt = /** @class */ (function () {
    function PlayIt() {
        this.destroyed = false;
        this.arch = (function () {
            // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
            if (!['x64', 'arm', 'arm64'].includes(process.arch))
                throw new Error("Unsupported Architecture, " + process.arch + "!");
            return process.arch;
        })();
        this.dir = (function () {
            var dir = os_1["default"].tmpdir() + "/playit";
            fs_extra_1["default"].mkdirpSync(dir);
            return dir;
        })();
        this.tunnels = [];
        this.agent_key = '';
        this.started = false;
        this.playit = undefined;
        this.preferred_tunnel = '';
        this.used_packets = 0;
        this.free_packets = 0;
        this.connections = [];
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
                ? os_1["default"].homedir() + "/Library/Application Support/playit/config.json"
                : os_1["default"].homedir() + "/.config/playit/config.json";
        this.downloadUrls = {
            win: "https://playit.gg/downloads/playit-win_64-" + this.version + ".exe",
            lin: "https://playit.gg/downloads/playit-linux_64-" + this.version,
            mac: "https://playit.gg/downloads/playit-darwin_64-" + this.version + ".zip",
            arm: "https://playit.gg/downloads/playit-armv7-" + this.version,
            aarch: "https://playit.gg/downloads/playit-aarch64-" + this.version
        };
        this.type = this.os === 'win'
            ? 'win'
            : this.os === 'mac'
                ? 'darwin'
                : this.os === 'lin' && this.arch === 'arm'
                    ? 'armv7'
                    : this.os === 'lin' && this.arch === 'arm64'
                        ? 'aarch64'
                        : 'linux';
        this.binary = undefined;
        this.output = '';
        this.stdout = '';
        this.stderr = '';
        this.errors = '';
        this.warnings = '';
        this.onOutput = undefined;
        this.onStdout = undefined;
        this.onStderr = undefined;
        this.onError = undefined;
        this.onWarning = undefined;
        process.chdir(this.dir);
    }
    /**
     * @param {number} id - The Tunnel ID
     * @description Disables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>);
     */
    PlayIt.prototype.disableTunnel = function (id) {
        if (id === void 0) { id = isRequired('ID'); }
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
    /**
     * @param {number} id - The Tunnel ID
     * @description Enables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
     * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
     */
    PlayIt.prototype.enableTunnel = function (id) {
        if (id === void 0) { id = isRequired('ID'); }
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
    /**
     * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
     * @description Creates A Tunnel With The Specified Port And Protocall
     * @example
     * const tunnel = await playit.createTunnel({ port: <Port>, proto: <Network Protocall> });
     * console.log(tunnel.url);
     */
    PlayIt.prototype.createTunnel = function (tunnelOpts) {
        if (tunnelOpts === void 0) { tunnelOpts = isRequired('Tunnel Options'); }
        return __awaiter(this, void 0, void 0, function () {
            var _a, proto, _b, port, tunnelId, _c, _d, _e, _f, otherData;
            var _g, _h;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _a = tunnelOpts.proto, proto = _a === void 0 ? 'TCP' : _a, _b = tunnelOpts.port, port = _b === void 0 ? isRequired('Port') : _b;
                        _c = this.fetch;
                        _d = ['/account/tunnels'];
                        _g = {
                            method: 'POST'
                        };
                        _f = (_e = JSON).stringify;
                        _h = {
                            id: null,
                            game: "custom-" + proto.toLowerCase(),
                            local_port: Number(port),
                            local_ip: '127.0.0.1',
                            local_proto: proto
                        };
                        return [4 /*yield*/, this.fetch('/account/agents')];
                    case 1: return [4 /*yield*/, (_j.sent()).json()];
                    case 2: return [4 /*yield*/, _c.apply(this, _d.concat([(_g.body = _f.apply(_e, [(_h.agent_id = (_j.sent()).agents.find(function (agent) { return agent.key === _this.agent_key; }).id,
                                    _h.domain_id = null,
                                    _h)]),
                                _g)]))];
                    case 3: return [4 /*yield*/, (_j.sent()).json()];
                    case 4:
                        tunnelId = (_j.sent()).id;
                        return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                var otherData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.fetch('/account/tunnels')];
                                        case 1: return [4 /*yield*/, (_a.sent()).json()];
                                        case 2:
                                            // Get More Data About The Tunnel
                                            otherData = (_a.sent()).tunnels.find(function (tunnel) { return tunnel.id === tunnelId; });
                                            return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 5000); })];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            if (otherData.domain_id === null ||
                                                otherData.connect_address === null) return [3 /*break*/, 0];
                                            _a.label = 5;
                                        case 5: return [2 /*return*/, otherData];
                                    }
                                });
                            }); })()];
                    case 5:
                        otherData = _j.sent();
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
    /**
     * @param {any} playitOpts - Options To Put Into The `.env` File
     * @description Starts PlayIt
     * @example
     * import { PlayIt } from 'playit.gg';
     * const playit = await new PlayIt.create(<Options For Playit>);
     */
    PlayIt.prototype.create = function (playitOpts) {
        if (playitOpts === void 0) { playitOpts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var outputCallbacks, stderrCallbacks, stdoutCallbacks, errorCallbacks, warningCallbacks, _a, dotenvStream, _loop_1, _b, _c, _d, opt, value, e_1_1, _e, _f, _g, _h, _j;
            var e_1, _k;
            var _this = this;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        this.started = true;
                        playitOpts.NO_BROWSER = true;
                        outputCallbacks = [], stderrCallbacks = [], stdoutCallbacks = [], errorCallbacks = [], warningCallbacks = [];
                        _a = this;
                        return [4 /*yield*/, this.download()];
                    case 1:
                        _a.binary = _l.sent();
                        dotenvStream = fs_extra_1["default"].createWriteStream(this.dir + "/.env", {
                            flags: 'w+'
                        });
                        _loop_1 = function (opt, value) {
                            return __generator(this, function (_m) {
                                switch (_m.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (res, rej) {
                                            return dotenvStream.write(opt + "=" + value + "\n", function (err) {
                                                return err ? rej(err) : res(null);
                                            });
                                        })];
                                    case 1:
                                        _m.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _l.label = 2;
                    case 2:
                        _l.trys.push([2, 7, 8, 9]);
                        _b = __values(Object.entries(playitOpts)), _c = _b.next();
                        _l.label = 3;
                    case 3:
                        if (!!_c.done) return [3 /*break*/, 6];
                        _d = __read(_c.value, 2), opt = _d[0], value = _d[1];
                        return [5 /*yield**/, _loop_1(opt, value)];
                    case 4:
                        _l.sent();
                        _l.label = 5;
                    case 5:
                        _c = _b.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _l.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_c && !_c.done && (_k = _b["return"])) _k.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        dotenvStream.end();
                        return [4 /*yield*/, fs_extra_1["default"].pathExists(this.configFile)];
                    case 10:
                        if (!_l.sent()) return [3 /*break*/, 12];
                        return [4 /*yield*/, fs_extra_1["default"].rm(this.configFile)];
                    case 11:
                        _l.sent();
                        _l.label = 12;
                    case 12: return [4 /*yield*/, fs_extra_1["default"].chmod(this.binary, 511)];
                    case 13:
                        _l.sent();
                        // Spawn The PlayIt Binary
                        this.playit = (0, child_process_1.spawn)(this.binary, {
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
                            if (data.toString().includes('ERRO')) {
                                _this.errors += data + "\n";
                                errorCallbacks.map(function (callback) { return callback(data.toString()); });
                            }
                            else if (data.toString().includes('WARN')) {
                                _this.warnings += data + "\n";
                                warningCallbacks.map(function (callback) { return callback(data.toString()); });
                            }
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
                        this.onError = function (callback) {
                            if (callback === void 0) { callback = function (output) { return output; }; }
                            callback(_this.errors);
                            errorCallbacks.push(callback);
                        };
                        this.onWarning = function (callback) {
                            if (callback === void 0) { callback = function (output) { return output; }; }
                            callback(_this.warnings);
                            warningCallbacks.push(callback);
                        };
                        exitHook(function () { return _this.stop(); });
                        this.parseOutput();
                        return [4 /*yield*/, new Promise(function (res) {
                                while (!fs_extra_1["default"].pathExistsSync(_this.configFile))
                                    ;
                                res(null);
                            })];
                    case 14:
                        _l.sent();
                        _f = (_e = Object).assign;
                        _g = [this];
                        _j = (_h = JSON).parse;
                        return [4 /*yield*/, fs_extra_1["default"].readFile(this.configFile, 'utf-8')];
                    case 15:
                        _f.apply(_e, _g.concat([_j.apply(_h, [_l.sent()])]));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * @description Stops PlayIt
     * @example
     * playit.stop(); // Stops PlayIt, Class Cannot Be Used After Run
     */
    PlayIt.prototype.stop = function () {
        if (this.destroyed)
            return;
        this.destroyed = true;
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        fs_extra_1["default"].rmSync(this.binary);
    };
    /**
     * @description Downloads PlayIt To A Temp Folder
     * @example
     * const playitBinary = await playit.download(); // Downloads PlayIt, And Returns The File Path
     */
    PlayIt.prototype.download = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var _this = this;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        file = this.dir + "/playit-" + this.type + "-" + this.version + "." + (this.os === 'win' ? 'exe' : 'bin');
                        return [4 /*yield*/, fs_extra_1["default"].pathExists(file)];
                    case 1:
                        if (_m.sent())
                            return [2 /*return*/, file];
                        if (!(this.os === 'mac')) return [3 /*break*/, 6];
                        _b = (_a = Promise).all;
                        _d = (_c = unzipper_1["default"].Open).buffer;
                        _f = (_e = Buffer).from;
                        return [4 /*yield*/, (0, make_fetch_happen_1["default"])(this.downloadUrls[this.os])];
                    case 2: return [4 /*yield*/, (_m.sent()).arrayBuffer()];
                    case 3: return [4 /*yield*/, _d.apply(_c, [_f.apply(_e, [_m.sent()])])];
                    case 4: return [4 /*yield*/, _b.apply(_a, [(_m.sent()).files.map(function (zipFile) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _a = zipFile.path.includes('playit') &&
                                                zipFile.type === 'File';
                                            if (!_a) return [3 /*break*/, 3];
                                            _c = (_b = fs_extra_1["default"]).writeFile;
                                            _d = [file];
                                            return [4 /*yield*/, zipFile.buffer()];
                                        case 1: return [4 /*yield*/, _c.apply(_b, _d.concat([_e.sent()]))];
                                        case 2:
                                            _a = (_e.sent());
                                            _e.label = 3;
                                        case 3: return [2 /*return*/, _a];
                                    }
                                });
                            }); })])];
                    case 5:
                        _m.sent();
                        return [3 /*break*/, 10];
                    case 6:
                        _h = (_g = fs_extra_1["default"]).writeFile;
                        _j = [file];
                        _l = (_k = Buffer).from;
                        return [4 /*yield*/, (0, make_fetch_happen_1["default"])(this.downloadUrls[this.os])];
                    case 7: return [4 /*yield*/, (_m.sent()).arrayBuffer()];
                    case 8: return [4 /*yield*/, _h.apply(_g, _j.concat([_l.apply(_k, [_m.sent()])]))];
                    case 9:
                        _m.sent();
                        _m.label = 10;
                    case 10: return [2 /*return*/, file];
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
                                    var _a;
                                    return ((_a = data.match(/https:\/\/[0-9a-z\.\/]*/gi)) === null || _a === void 0 ? void 0 : _a[0])
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
                            var connectionInfo = /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): new client connecting to 127\.0\.0\.1:([0-9]*)|INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p) host=>tunnel: closed due to peer EOF, mapping: host=>tunnel/.exec(output);
                            var closedConnectionInfo = /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): fully closed/.exec(output);
                            if (connectionInfo) {
                                _this.connections.push({
                                    ip: connectionInfo[1],
                                    tunnel: _this.tunnels.find(function (tunnel) {
                                        return tunnel.game === "custom-" + connectionInfo[2] &&
                                            tunnel.local_port === Number(connectionInfo[3]);
                                    }),
                                    type: connectionInfo[2]
                                });
                            }
                            if (closedConnectionInfo) {
                                _this.connections.filter(function (connection) {
                                    return connection.ip !== closedConnectionInfo[1] &&
                                        connection.type !== closedConnectionInfo[2];
                                });
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayIt.prototype.fetch = function (url, data) {
        if (url === void 0) { url = isRequired('URL'); }
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(url.startsWith('https://') || url.startsWith('http://'))) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, make_fetch_happen_1["default"])(url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!url.startsWith('/')) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, make_fetch_happen_1["default"])("https://api.playit.gg" + url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, (0, make_fetch_happen_1["default"])("https://api.playit.gg/" + url, __assign(__assign({}, data), { headers: { authorization: "agent " + this.agent_key } }))];
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
module.exports = Object.assign(init, module.exports);
// https://github.com/sindresorhus/exit-hook/ but for CommonJS
var callbacks = new Set();
var isCalled = false;
var isRegistered = false;
var exit = function (shouldManuallyExit, signal) {
    var e_2, _a;
    if (isCalled) {
        return;
    }
    isCalled = true;
    try {
        for (var callbacks_1 = __values(callbacks), callbacks_1_1 = callbacks_1.next(); !callbacks_1_1.done; callbacks_1_1 = callbacks_1.next()) {
            var callback = callbacks_1_1.value;
            callback();
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (callbacks_1_1 && !callbacks_1_1.done && (_a = callbacks_1["return"])) _a.call(callbacks_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    if (shouldManuallyExit === true) {
        process.exit(128 + signal); // eslint-disable-line unicorn/no-process-exit
    }
};
function exitHook(onExit) {
    callbacks.add(onExit);
    if (!isRegistered) {
        isRegistered = true;
        process.once('exit', exit);
        process.once('SIGINT', exit.bind(undefined, true, 2));
        process.once('SIGTERM', exit.bind(undefined, true, 15));
        // PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
        // explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
        // event cannot support async handlers, since the event loop is never called after it.
        process.on('message', function (message) {
            if (message === 'shutdown') {
                exit(true, -128);
            }
        });
    }
    return function () {
        callbacks["delete"](onExit);
    };
}
