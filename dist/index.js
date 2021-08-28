import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import exitHook from 'exit-hook';
import nodeOS from 'node:os';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'url';
import Zip from 'adm-zip';
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);
global.require = createRequire(__filename);
export class PlayIt {
    constructor() {
        this.destroyed = false;
        this.arch = (() => {
            // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
            if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
                throw new Error(`Unsupported Architecture, ${process.arch}!`);
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
                local_proto: proto,
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
        dotenvStream.end();
        if (await fs.pathExists(this.configFile))
            await fs.rm(this.configFile);
        await fs.chmod(this.binary, 0o777);
        // Spawn The PlayIt Binary
        this.playit = spawn(this.binary, {
            cwd: __dirname
        });
        exitHook(this.stop);
        url = await new Promise((resolve) => this.playit.stderr.on('data', (data) => data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
            : ''));
        this.agent = JSON.parse(await fs.readFile(this.configFile, 'utf-8'));
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
        let file = `${nodeOS.tmpdir()}/playit/${require('nanoid').nanoid(20)}.${os === 'win' ? 'exe' : os === 'mac' ? 'zip' : 'bin'}`;
        await fs.mkdirp(dirname(file));
        await fs.writeFile(file, Buffer.from(await (await fetch(this.downloadUrls[os])).arrayBuffer()));
        if (os === 'mac') {
            new Zip(file)
                .getEntries()
                .map((file) => file.entryName.includes('playit') &&
                fs.writeFileSync(`${file}.bin`, file.getData()));
        }
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
