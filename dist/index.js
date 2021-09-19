import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import fetch from 'make-fetch-happen';
import exitHook from 'exit-hook';
import nodeOS from 'node:os';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Zip from 'unzipper';
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);
global.require = createRequire(__filename);
/**  @class */
export class PlayIt {
    constructor() {
        this.destroyed = false;
        this.arch = (() => {
            // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
            if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
                throw new Error(`Unsupported Architecture, ${process.arch}!`);
            return process.arch;
        })();
        this.dir = (() => {
            const dir = `${nodeOS.tmpdir()}/playit`;
            fs.mkdirpSync(dir);
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
            ? `${process.env.AppData}/playit/config.json`
            : this.os === 'mac'
                ? `${nodeOS.homedir()}/Library/Application Support/playit/config.json`
                : `${nodeOS.homedir()}/.config/playit/config.json`;
        this.downloadUrls = {
            win: `https://playit.gg/downloads/playit-win_64-${this.version}.exe`,
            lin: `https://playit.gg/downloads/playit-linux_64-${this.version}`,
            mac: `https://playit.gg/downloads/playit-darwin_64-${this.version}.zip`,
            arm: `https://playit.gg/downloads/playit-armv7-${this.version}`,
            aarch: `https://playit.gg/downloads/playit-aarch64-${this.version}`
        };
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
    async disableTunnel(id = isRequired('ID')) {
        await this.fetch(`/account/tunnels/${id}/disable`);
    }
    /**
     * @param {number} id - The Tunnel ID
     * @description Enables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
     * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
     */
    async enableTunnel(id = isRequired('ID')) {
        await this.fetch(`/account/tunnels/${id}/enable`);
    }
    /**
     * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
     * @description Creates A Tunnel With The Specified Port And Protocall
     * @example
     * console.log((await playit.createTunnel({ port: <Port>, proto: <Network Protocall> })
     */
    async createTunnel(tunnelOpts = isRequired('Tunnel Options')) {
        let { proto = 'TCP', port } = tunnelOpts;
        // Create The Tunnel, And Get The Id
        const tunnelId = (await (await this.fetch('/account/tunnels', {
            method: 'POST',
            body: JSON.stringify({
                id: null,
                game: `custom-${proto.toLowerCase()}`,
                local_port: Number(port),
                local_ip: '127.0.0.1',
                local_proto: proto,
                agent_id: (await (await this.fetch('/account/agents')).json()).agents.find((agent) => agent.key === this.agent_key).id,
                domain_id: null
            })
        })).json()).id;
        // Get More Data About The Tunnel
        let otherData = (await (await this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
        while (otherData.domain_id === null || otherData.connect_address === null) {
            otherData = (await (await this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
        }
        otherData.url = otherData.connect_address;
        this.tunnels.push(otherData);
        return otherData;
    }
    async claimUrl(url = isRequired('URL')) {
        await this.fetch(url);
    }
    /**
     * @param {any} playitOpts - Options To Put Into The `.env` File
     * @description Starts PlayIt
     * @example
     * import { PlayIt } from 'playit.gg';
     * const playit = await new PlayIt.create(<Options For Playit>);
     */
    async create(playitOpts = {}) {
        this.started = true;
        playitOpts.NO_BROWSER = true;
        let outputCallbacks = [], stderrCallbacks = [], stdoutCallbacks = [], errorCallbacks = [], warningCallbacks = [];
        this.binary = await this.download();
        const dotenvStream = fs.createWriteStream(`${this.dir}/.env`, {
            flags: 'w+'
        });
        for (const [opt, value] of Object.entries(playitOpts))
            await new Promise((res, rej) => dotenvStream.write(`${opt}=${value}\n`, (err) => err ? rej(err) : res(null)));
        dotenvStream.end();
        if (await fs.pathExists(this.configFile))
            await fs.rm(this.configFile);
        await fs.chmod(this.binary, 0o777);
        // Spawn The PlayIt Binary
        this.playit = spawn(this.binary, {
            cwd: this.dir
        });
        this.playit.stdout.on('data', (data) => {
            this.output += `${data}\n`;
            this.stdout += `${data}\n`;
            outputCallbacks.map((callback) => callback(data.toString()));
            stdoutCallbacks.map((callback) => callback(data.toString()));
        });
        this.playit.stderr.on('data', (data) => {
            this.output += `${data}\n`;
            this.stderr += `${data}\n`;
            outputCallbacks.map((callback) => callback(data.toString()));
            stderrCallbacks.map((callback) => callback(data.toString()));
            if (data.toString().includes('ERRO')) {
                this.errors += `${data}\n`;
                errorCallbacks.map((callback) => callback(data.toString()));
            }
            else if (data.toString().includes('WARN')) {
                this.warnings += `${data}\n`;
                warningCallbacks.map((callback) => callback(data.toString()));
            }
        });
        this.onOutput = (callback = (output) => output) => {
            callback(this.output);
            outputCallbacks.push(callback);
        };
        this.onStdout = (callback = (output) => output) => {
            callback(this.stdout);
            stdoutCallbacks.push(callback);
        };
        this.onStderr = (callback = (output) => output) => {
            callback(this.stderr);
            stderrCallbacks.push(callback);
        };
        this.onError = (callback = (output) => output) => {
            callback(this.errors);
            errorCallbacks.push(callback);
        };
        this.onWarning = (callback = (output) => output) => {
            callback(this.warnings);
            warningCallbacks.push(callback);
        };
        exitHook(() => this.stop());
        this.parseOutput();
        await new Promise((res) => {
            while (!fs.pathExistsSync(this.configFile))
                ;
            res(null);
        });
        Object.assign(this, JSON.parse(await fs.readFile(this.configFile, 'utf-8')));
        return this;
    }
    /**
     * @description Stops PlayIt
     * @example
     * playit.stop(); // Stops PlayIt, Class Cannot Be Used After Run
     */
    stop() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        fs.rmSync(this.binary);
    }
    /**
     * @description Downloads PlayIt To A Temp Folder
     * @example
     * const playitBinary = await playit.download(); // Downloads PlayIt, And Returns The File Path
     */
    async download() {
        let file = `${this.dir}/${require('nanoid').nanoid(20)}.${this.os === 'win' ? 'exe' : 'bin'}`;
        if (this.os === 'mac') {
            await Promise.all((await Zip.Open.buffer(Buffer.from(await (await fetch(this.downloadUrls[this.os])).arrayBuffer()))).files.map(async (zipFile) => zipFile.path.includes('playit') &&
                zipFile.type === 'File' &&
                (await fs.writeFile(file, await zipFile.buffer()))));
        }
        else {
            await fs.writeFile(file, Buffer.from(await (await fetch(this.downloadUrls[this.os])).arrayBuffer()));
        }
        return file;
    }
    async parseOutput() {
        await this.claimUrl(await new Promise((res) => this.onStderr((data) => data.match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? res(data.match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
            : '')));
        this.onStderr((output) => {
            let packetInfo = /INFO Allocator: used packets: [0-9]*, free packets: [0-9]*/.exec(output);
            if (packetInfo) {
                this.used_packets = parseInt(packetInfo[1]);
                this.free_packets = parseInt(packetInfo[2]);
            }
            let connectionInfo = /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): new client connecting to 127\.0\.0\.1:([0-9]*)|INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p) host=>tunnel: closed due to peer EOF, mapping: host=>tunnel/.exec(output);
            let closedConnectionInfo = /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): fully closed/.exec(output);
            if (connectionInfo) {
                this.connections.push({
                    ip: connectionInfo[1],
                    tunnel: this.tunnels.find((tunnel) => tunnel.game === `custom-${connectionInfo[2]}` &&
                        tunnel.local_port === Number(connectionInfo[3])),
                    type: connectionInfo[2]
                });
            }
            if (closedConnectionInfo) {
                this.connections.filter((connection) => connection.ip !== closedConnectionInfo[1] &&
                    connection.type !== closedConnectionInfo[2]);
            }
        });
    }
    async fetch(url = isRequired('URL'), data = {}) {
        if (url.startsWith('https://') || url.startsWith('http://'))
            return await fetch(url, {
                ...data,
                headers: { authorization: `agent ${this.agent_key}` }
            });
        else if (url.startsWith('/'))
            return await fetch(`https://api.playit.gg${url}`, {
                ...data,
                headers: { authorization: `agent ${this.agent_key}` }
            });
        else
            return await fetch(`https://api.playit.gg/${url}`, {
                ...data,
                headers: { authorization: `agent ${this.agent_key}` }
            });
    }
}
function isRequired(argumentName) {
    // If A Required Argument Isn't Provided, Throw An Error
    throw new TypeError(`${argumentName} is a required argument.`);
}
export default async (playitOpts = {}) => await new PlayIt().create(playitOpts);
