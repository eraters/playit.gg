"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playit = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const exit_hook_1 = __importDefault(require("exit-hook"));
const os_1 = require("os");
class playit {
    constructor() {
        this.destroyed = false;
        this.arch = (() => {
            // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
            if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
                throw new Error('Unsupported Architecture!');
            return process.arch;
        })();
        this.tunnels = [];
        this.agent = undefined;
        this.started = false;
        this.playit = undefined;
        // Get Os
        this.os = process.platform === 'win32'
            ? 'win'
            : process.platform === 'darwin'
                ? 'mac'
                : 'lin';
        this.version = '0.4.4';
        this.configFile = this.os === 'win'
            ? `${process.env.AppData}/playit/config.json`
            : `${os_1.homedir()}/.config/playit/config.json`;
        this.downloadUrls = {
            win: `https://playit.gg/downloads/playit-win_64-${this.version}.exe`,
            lin: `https://playit.gg/downloads/playit-linux_64-${this.version}`,
            mac: `https://playit.gg/downloads/playit-darwin_64-${this.version}`,
            arm: `https://playit.gg/downloads/playit-armv7-${this.version}`,
            aarch: `https://playit.gg/downloads/playit-aarch64-${this.version}`
        };
        this.binary = undefined;
    }
    disableTunnel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetch(`/account/tunnels/${id}/disable`);
        });
    }
    enableTunnel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetch(`/account/tunnels/${id}/enable`);
        });
    }
    createTunnel(tunnelOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { proto = 'TCP', port = 80 } = tunnelOpts || {};
            port = Number(port);
            // Create The Tunnel, And Get The Id
            const tunnelId = (yield (yield this.fetch('/account/tunnels', {
                method: 'POST',
                body: JSON.stringify({
                    id: null,
                    game: `custom-${proto.toLowerCase()}`,
                    local_port: port,
                    local_ip: '127.0.0.1',
                    local_proto: proto.replace(/./g, (m, o) => o === 0 ? m.toUpperCase() : m.toLowerCase()),
                    agent_id: (yield (yield this.fetch('/account/agents')).json()).agents.find((agent) => agent.key === this.agent.agent_key)
                        .id,
                    domain_id: null
                })
            })).json()).id;
            // Get More Data About The Tunnel
            let otherData = (yield (yield this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
            while (otherData.domain_id === null || otherData.connect_address === null) {
                let time = new Date().getTime();
                while (new Date().getTime() < time + 1000)
                    ;
                otherData = (yield (yield this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
            }
            otherData.url = otherData.connect_address;
            this.tunnels.push(otherData);
            return otherData;
        });
    }
    claimUrl(url = isRequired('URL')) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetch(url);
            return url;
        });
    }
    create(startOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            let { playitOpts = {} } = startOpts || {};
            this.started = true;
            playitOpts.NO_BROWSER = true;
            let url;
            this.binary = yield this.download();
            const dotenvStream = fs_1.default.createWriteStream(`${__dirname}/.env`, {
                flags: 'w+'
            });
            // If A Previous Config File Exists, Remove It
            for (const [opt, value] of Object.entries(playitOpts))
                yield new Promise((res, rej) => dotenvStream.write(`${opt}=${value}\n`, (err) => err ? rej(err) : res(undefined)));
            if (fs_1.default.existsSync(this.configFile))
                fs_1.default.rmSync(this.configFile);
            fs_1.default.chmodSync(this.binary, 0o777);
            // Spawn The PlayIt Binary
            this.playit = child_process_1.spawn(this.binary, {
                cwd: __dirname
            });
            exit_hook_1.default(() => {
                this.stop();
            });
            url = yield new Promise((resolve) => this.playit.stderr.on('data', (data) => data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
                ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
                : ''));
            this.agent = JSON.parse(fs_1.default.readFileSync(this.configFile, 'utf-8'));
            this.claimUrl(url);
            return this;
        });
    }
    stop() {
        this.destroyed = true;
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        fs_1.default.rmSync(this.binary);
    }
    download(os = this.os) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = `${os_1.tmpdir()}/${require('nanoid').nanoid()}`;
            fs_1.default.writeFileSync(file, Buffer.from(yield (yield node_fetch_1.default(this.downloadUrls[os])).arrayBuffer()));
            return file;
        });
    }
    fetch(url, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url.startsWith('https://') || url.startsWith('http://'))
                return yield node_fetch_1.default(url, Object.assign(Object.assign({}, data), { headers: { authorization: `agent ${this.agent.agent_key}` } }));
            else if (url.startsWith('/'))
                return yield node_fetch_1.default(`https://api.playit.gg${url}`, Object.assign(Object.assign({}, data), { headers: { authorization: `agent ${this.agent.agent_key}` } }));
            else
                return yield node_fetch_1.default(`https://api.playit.gg/${url}`, Object.assign(Object.assign({}, data), { headers: { authorization: `agent ${this.agent.agent_key}` } }));
        });
    }
}
exports.playit = playit;
function isRequired(argumentName) {
    // If A Required Argument Isn't Provided, Throw An Error
    throw new TypeError(`${argumentName} is a required argument.`);
}
function init(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        let { playitOpts = {}, justConstructor = false } = opts || {};
        let newPlayIt = justConstructor
            ? new playit()
            : yield new playit().create({ playitOpts });
        return newPlayIt;
    });
}
exports.default = init;
module.exports = init;
