import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fetch from 'node-fetch';
import exitHook from 'exit-hook';
import nodeOS from 'node:os';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);
global.require = createRequire(import.meta.url);
export class PlayIt {
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
            : `${nodeOS.homedir()}/.config/playit/config.json`;
        this.downloadUrls = {
            win: `https://playit.gg/downloads/playit-win_64-${this.version}.exe`,
            lin: `https://playit.gg/downloads/playit-linux_64-${this.version}`,
            mac: `https://playit.gg/downloads/playit-darwin_64-${this.version}`,
            arm: `https://playit.gg/downloads/playit-armv7-${this.version}`,
            aarch: `https://playit.gg/downloads/playit-aarch64-${this.version}`
        };
        this.binary = undefined;
    }
    async disableTunnel(id) {
        await this.fetch(`/account/tunnels/${id}/disable`);
    }
    async enableTunnel(id) {
        await this.fetch(`/account/tunnels/${id}/enable`);
    }
    async createTunnel(tunnelOpts) {
        let { proto = 'TCP', port = 80 } = tunnelOpts || {};
        // Create The Tunnel, And Get The Id
        const tunnelId = (await (await this.fetch('/account/tunnels', {
            method: 'POST',
            body: JSON.stringify({
                id: null,
                game: `custom-${proto.toLowerCase()}`,
                local_port: Number(port),
                local_ip: '127.0.0.1',
                local_proto: proto.toUpperCase(),
                agent_id: (await (await this.fetch('/account/agents')).json()).agents.find((agent) => agent.key === this.agent.agent_key)
                    .id,
                domain_id: null
            })
        })).json()).id;
        // Get More Data About The Tunnel
        let otherData = (await (await this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
        while (otherData.domain_id === null || otherData.connect_address === null) {
            let time = new Date().getTime();
            while (new Date().getTime() < time + 1000)
                ;
            otherData = (await (await this.fetch('/account/tunnels')).json()).tunnels.find((tunnel) => tunnel.id === tunnelId);
        }
        otherData.url = otherData.connect_address;
        this.tunnels.push(otherData);
        return otherData;
    }
    async claimUrl(url = isRequired('URL')) {
        await this.fetch(url);
    }
    async create(playitOpts = {}) {
        this.started = true;
        playitOpts.NO_BROWSER = true;
        let url;
        this.binary = await this.download();
        const dotenvStream = fs.createWriteStream(`${__dirname}/.env`, {
            flags: 'w+'
        });
        for (const [opt, value] of Object.entries(playitOpts))
            await new Promise((res, rej) => dotenvStream.write(`${opt}=${value}\n`, (err) => err ? rej(err) : res(undefined)));
        if (fs.existsSync(this.configFile))
            fs.rmSync(this.configFile);
        fs.chmodSync(this.binary, 0o777);
        // Spawn The PlayIt Binary
        this.playit = spawn(this.binary, {
            cwd: __dirname
        });
        exitHook(() => {
            this.stop();
        });
        url = await new Promise((resolve) => this.playit.stderr.on('data', (data) => data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
            : ''));
        this.agent = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
        this.claimUrl(url);
        return this;
    }
    stop() {
        this.destroyed = true;
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        fs.rmSync(this.binary);
    }
    async download(os = this.os) {
        let file = `${nodeOS.tmpdir()}/${require('nanoid').nanoid()}${this.os === 'win' ? '.exe' : ''}`;
        fs.writeFileSync(file, Buffer.from(await (await fetch(this.downloadUrls[os])).arrayBuffer()));
        return file;
    }
    async fetch(url, data = {}) {
        if (url.startsWith('https://') || url.startsWith('http://'))
            return await fetch(url, {
                ...data,
                headers: { authorization: `agent ${this.agent.agent_key}` }
            });
        else if (url.startsWith('/'))
            return await fetch(`https://api.playit.gg${url}`, {
                ...data,
                headers: { authorization: `agent ${this.agent.agent_key}` }
            });
        else
            return await fetch(`https://api.playit.gg/${url}`, {
                ...data,
                headers: { authorization: `agent ${this.agent.agent_key}` }
            });
    }
}
function isRequired(argumentName) {
    // If A Required Argument Isn't Provided, Throw An Error
    throw new TypeError(`${argumentName} is a required argument.`);
}
export default async function init(playitOpts = {}) {
    return await new PlayIt().create(playitOpts);
}
