const { spawn } = require('child_process');
import fs from 'fs';
import fetch from 'node-fetch';

class playit {
  destroyed: Boolean = false;

  arch: String = (() => {
    // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
    if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
      throw new Error('Unsupported Architecture!');

    return process.arch;
  })();

  tunnels: tunnel[] = [];
  plugin: any;
  agent: agent;
  started: Boolean = false;
  playit: any;

  // Get Os
  os: string =
    process.platform === 'win32'
      ? 'win'
      : process.platform === 'darwin'
      ? 'mac'
      : 'lin';

  constructor() {}

  public async disableTunnel(id: number): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/disable`);
  }

  public async enableTunnel(id: number): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/enable`);
  }

  public async createTunnel(tunnelOpts?: tunnelOpts): Promise<Object> {
    let { proto = 'TCP', port = 80 } = tunnelOpts || {};

    // Create The Tunnel, And Get The Id
    const tunnelId = (
      await (
        await this.fetch('/account/tunnels', {
          method: 'POST',
          body: JSON.stringify({
            id: null,
            game: `custom-${proto.toLowerCase()}`,
            local_port: port,
            local_ip: '127.0.0.1',
            local_proto: proto.replace(/./g, (m: string, o: number) =>
              o === 0 ? m.toUpperCase() : m.toLowerCase()
            ),
            agent_id: (
              await (await this.fetch('/account/agents')).json()
            ).agents.find((agent: any) => agent.key === this.agent.agent_key)
              .id,
            domain_id: null
          })
        })
      ).json()
    ).id;

    // Get More Data About The Tunnel
    let otherData = (
      await (await this.fetch('/account/tunnels')).json()
    ).tunnels.find((tunnel: any) => tunnel.id === tunnelId);

    while (otherData.domain_id === null || otherData.connect_address === null) {
      let time = new Date().getTime();
      while (new Date().getTime() < time + 1000);
      otherData = (
        await (await this.fetch('/account/tunnels')).json()
      ).tunnels.find((tunnel: any) => tunnel.id === tunnelId);
    }

    otherData.url = otherData.connect_address;

    this.tunnels.push(otherData);

    return otherData;
  }

  private async claimUrl(url: string = isRequired('URL')) {
    await this.fetch(url);

    return url;
  }

  public async create(startOpts?: startOpts): Promise<{
    url: string;
    playit: playit;
  }> {
    let { claim = true, playitOpts = {} } = startOpts || {};
    this.started = true;
    playitOpts.NO_BROWSER = true;
    let url: string;

    const dotenvStream = fs.createWriteStream(`${__dirname}/.env`, {
      flags: 'w+'
    });

    // If A Previous Config File Exists, Remove It
    for (const [opt, value] of Object.entries(playitOpts))
      await new Promise((res, rej) =>
        dotenvStream.write(`${opt}=${value}\n`, (err) =>
          err ? rej(err) : res(undefined)
        )
      );

    if (
      fs.existsSync(
        this.os === 'win'
          ? `${process.env.AppData}/playit/config.json`
          : `${require('os').homedir()}/.config/playit/config.json`
      )
    )
      fs.rmSync(
        this.os === 'win'
          ? `${process.env.AppData}/playit/config.json`
          : `${require('os').homedir()}/.config/playit/config.json`
      );

    fs.chmodSync(
      `${__dirname}/../binaries/playit.${
        this.os === 'win'
          ? 'exe'
          : this.os === 'mac'
          ? 'mac'
          : this.arch === 'arm64'
          ? 'aarch'
          : this.arch === 'arm'
          ? 'arm'
          : 'lin'
      }`,
      0o777
    );

    // Spawn The PlayIt Binary
    this.playit = spawn(
      `${__dirname}/../binaries/playit.${
        this.os === 'win'
          ? 'exe'
          : this.os === 'mac'
          ? 'mac'
          : this.arch === 'arm64'
          ? 'aarch'
          : this.arch === 'arm'
          ? 'arm'
          : 'lin'
      }`,
      {
        cwd: __dirname,
        encoding: 'utf8'
      }
    );

    url = await new Promise((resolve) =>
      this.playit.stderr.on('data', (data: Buffer) =>
        data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
          ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
          : ''
      )
    );

    this.agent = JSON.parse(
      fs.readFileSync(
        this.os === 'win'
          ? `${process.env.AppData}/playit/config.json`
          : `${require('os').homedir()}/.config/playit/config.json`,
        'utf-8'
      )
    );

    if (claim === true) this.claimUrl(url);

    return { url, playit: this };
  }

  public async stop(): Promise<void> {
    this.destroyed = true;
    // Kill The PlayIt Binary
    this.playit.kill('SIGINT');
  }

  private async fetch(url: string, data: Object = {}): Promise<any> {
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

  public async startPlugin(
    plugin: Function = (playit: playit) => playit
  ): Promise<any> {
    plugin;
  }
}

function isRequired(argumentName: string): any {
  // If A Required Argument Isn't Provided, Throw An Error
  throw new TypeError(`${argumentName} is a required argument.`);
}

async function init(opts?: startOpts): Promise<playit> {
  let { playitOpts = {} } = opts || {};

  let newPlayIt = (await new playit().create({ claim: true, playitOpts }))
    .playit;

  return newPlayIt;
}

interface startOpts {
  claim?: boolean;
  playitOpts?: any;
}

interface tunnelOpts {
  proto?: string;
  port?: number;
}

interface agent {
  agent_key: string;
  preferred_tunnel: string;
}

interface tunnel {
  id: number;
  agent_id: number;
  game: string;
  local_ip: '127.0.0.1';
  local_port: number;
  domain_id: number;
  status: 'Active';
  connect_address: string;
  is_custom_domain: false;
  tunnel_version: number;
  url: string;
}

module.exports = init;