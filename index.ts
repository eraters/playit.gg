import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
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
  destroyed: Boolean = false;

  arch: String = (() => {
    // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
    if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
      throw new Error(`Unsupported Architecture, ${process.arch}!`);

    return process.arch;
  })();

  dir: string = (() => {
    const dir = `${nodeOS.tmpdir()}/playit`;
    fs.mkdirpSync(dir);
    return dir;
  })();

  tunnels: tunnel[] = [];
  agent_key: string = '';
  started: Boolean = false;
  playit: ChildProcessWithoutNullStreams | undefined = undefined;
  preferred_tunnel: string = '';
  used_packets: number = 0;
  free_packets: number = 0;
  connections: connection[] = [];

  // Get Os
  os: os =
    process.platform === 'win32'
      ? 'win'
      : process.platform === 'darwin'
      ? 'mac'
      : 'lin';

  version: string = '0.4.6';

  configFile: string =
    this.os === 'win'
      ? `${process.env.AppData}/playit/config.json`
      : this.os === 'mac'
      ? `${nodeOS.homedir()}/Library/Application Support/playit/config.json`
      : `${nodeOS.homedir()}/.config/playit/config.json`;

  downloadUrls: binaries = {
    win: `https://playit.gg/downloads/playit-win_64-${this.version}.exe`,
    lin: `https://playit.gg/downloads/playit-linux_64-${this.version}`,
    mac: `https://playit.gg/downloads/playit-darwin_64-${this.version}.zip`,
    arm: `https://playit.gg/downloads/playit-armv7-${this.version}`,
    aarch: `https://playit.gg/downloads/playit-aarch64-${this.version}`
  };

  binary: string | undefined = undefined;

  output: string = '';
  stdout: string = '';
  stderr: string = '';
  errors: string = '';
  warnings: string = '';
  onOutput: Function | undefined = undefined;
  onStdout: Function | undefined = undefined;
  onStderr: Function | undefined = undefined;
  onError: Function | undefined = undefined;
  onWarning: Function | undefined = undefined;

  constructor() {
    process.chdir(this.dir);
  }

  /**
   * @param {number} id - The Tunnel ID
   * @description Disables The Specified Tunnel
   * @example
   * await playit.disableTunnel(<Tunnel ID>);
   */
  public async disableTunnel(id: number = isRequired('ID')): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/disable`);
  }

  /**
   * @param {number} id - The Tunnel ID
   * @description Enables The Specified Tunnel
   * @example
   * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
   * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
   */
  public async enableTunnel(id: number = isRequired('ID')): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/enable`);
  }

  /**
   * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
   * @description Creates A Tunnel With The Specified Port And Protocall
   * @example
   * console.log((await playit.createTunnel({ port: <Port>, proto: <Network Protocall> })
   */
  public async createTunnel(
    tunnelOpts: tunnelOpts = isRequired('Tunnel Options')
  ): Promise<tunnel> {
    let { proto = 'TCP', port } = tunnelOpts;

    // Create The Tunnel, And Get The Id
    const tunnelId: number = (
      await (
        await this.fetch('/account/tunnels', {
          method: 'POST',
          body: JSON.stringify({
            id: null,
            game: `custom-${proto.toLowerCase()}`,
            local_port: Number(port),
            local_ip: '127.0.0.1',
            local_proto: proto,
            agent_id: (
              await (await this.fetch('/account/agents')).json()
            ).agents.find((agent: any) => agent.key === this.agent_key).id,
            domain_id: null
          })
        })
      ).json()
    ).id;

    let otherData = await (async () => {
      let otherData: tunnel;
      do {
        // Get More Data About The Tunnel
        otherData = (
          await (await this.fetch('/account/tunnels')).json()
        ).tunnels.find((tunnel: tunnel) => tunnel.id === tunnelId);
      } while (
        otherData.domain_id === null ||
        otherData.connect_address === null
      );

      return otherData;
    })();

    otherData.url = otherData.connect_address;

    this.tunnels.push(otherData);

    return otherData;
  }

  private async claimUrl(url: string = isRequired('URL')): Promise<void> {
    await this.fetch(url);
  }

  /**
   * @param {any} playitOpts - Options To Put Into The `.env` File
   * @description Starts PlayIt
   * @example
   * import { PlayIt } from 'playit.gg';
   * const playit = await new PlayIt.create(<Options For Playit>);
   */
  public async create(playitOpts: any = {}): Promise<PlayIt> {
    this.started = true;
    playitOpts.NO_BROWSER = true;
    let outputCallbacks: Function[] = [],
      stderrCallbacks: Function[] = [],
      stdoutCallbacks: Function[] = [],
      errorCallbacks: Function[] = [],
      warningCallbacks: Function[] = [];

    this.binary = await this.download();

    const dotenvStream = fs.createWriteStream(`${this.dir}/.env`, {
      flags: 'w+'
    });

    for (const [opt, value] of Object.entries(playitOpts))
      await new Promise((res, rej) =>
        dotenvStream.write(`${opt}=${value}\n`, (err) =>
          err ? rej(err) : res(null)
        )
      );

    dotenvStream.end();

    if (await fs.pathExists(this.configFile)) await fs.rm(this.configFile);

    await fs.chmod(this.binary, 0o777);

    // Spawn The PlayIt Binary
    this.playit = spawn(this.binary, {
      cwd: this.dir
    });

    this.playit.stdout.on('data', (data: Buffer) => {
      this.output += `${data}\n`;
      this.stdout += `${data}\n`;
      outputCallbacks.map((callback) => callback(data.toString()));
      stdoutCallbacks.map((callback) => callback(data.toString()));
    });
    this.playit.stderr.on('data', (data: Buffer) => {
      this.output += `${data}\n`;
      this.stderr += `${data}\n`;
      outputCallbacks.map((callback) => callback(data.toString()));
      stderrCallbacks.map((callback) => callback(data.toString()));
      if (data.toString().includes('ERRO')) {
        this.errors += `${data}\n`;
        errorCallbacks.map((callback) => callback(data.toString()));
      } else if (data.toString().includes('WARN')) {
        this.warnings += `${data}\n`;
        warningCallbacks.map((callback) => callback(data.toString()));
      }
    });

    this.onOutput = (callback: Function = (output: string[]) => output) => {
      callback(this.output);
      outputCallbacks.push(callback);
    };

    this.onStdout = (callback: Function = (output: string[]) => output) => {
      callback(this.stdout);
      stdoutCallbacks.push(callback);
    };

    this.onStderr = (callback: Function = (output: string[]) => output) => {
      callback(this.stderr);
      stderrCallbacks.push(callback);
    };

    this.onError = (callback: Function = (output: string[]) => output) => {
      callback(this.errors);
      errorCallbacks.push(callback);
    };

    this.onWarning = (callback: Function = (output: string[]) => output) => {
      callback(this.warnings);
      warningCallbacks.push(callback);
    };

    exitHook(() => this.stop());

    this.parseOutput();

    await new Promise((res) => {
      while (!fs.pathExistsSync(this.configFile));
      res(null);
    });

    Object.assign(
      this,
      JSON.parse(await fs.readFile(this.configFile, 'utf-8'))
    );

    return this;
  }

  /**
   * @description Stops PlayIt
   * @example
   * playit.stop(); // Stops PlayIt, Class Cannot Be Used After Run
   */
  public stop(): void {
    if (this.destroyed) return;
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
  public async download(): Promise<string> {
    let file = `${this.dir}/${require('nanoid').nanoid(20)}.${
      this.os === 'win' ? 'exe' : 'bin'
    }`;

    if (this.os === 'mac') {
      await Promise.all(
        (
          await Zip.Open.buffer(
            Buffer.from(
              await (await fetch(this.downloadUrls[this.os])).arrayBuffer()
            )
          )
        ).files.map(
          async (zipFile) =>
            zipFile.path.includes('playit') &&
            zipFile.type === 'File' &&
            (await fs.writeFile(file, await zipFile.buffer()))
        )
      );
    } else {
      await fs.writeFile(
        file,
        Buffer.from(
          await (await fetch(this.downloadUrls[this.os])).arrayBuffer()
        )
      );
    }

    return file;
  }

  private async parseOutput() {
    await this.claimUrl(
      await new Promise((res) =>
        this.onStderr((data: string) =>
          data.match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? res(data.match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
            : ''
        )
      )
    );

    this.onStderr((output: string) => {
      let packetInfo =
        /INFO Allocator: used packets: [0-9]*, free packets: [0-9]*/.exec(
          output
        );
      if (packetInfo) {
        this.used_packets = parseInt(packetInfo[1]);
        this.free_packets = parseInt(packetInfo[2]);
      }

      let connectionInfo =
        /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): new client connecting to 127\.0\.0\.1:([0-9]*)|INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p) host=>tunnel: closed due to peer EOF, mapping: host=>tunnel/.exec(
          output
        );

      let closedConnectionInfo =
        /INFO ([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)\/([tu][dc]p): fully closed/.exec(
          output
        );

      if (connectionInfo) {
        this.connections.push({
          ip: connectionInfo[1],
          tunnel: this.tunnels.find(
            (tunnel: tunnel) =>
              tunnel.game === `custom-${connectionInfo[2]}` &&
              tunnel.local_port === Number(connectionInfo[3])
          ),
          type: connectionInfo[2] as 'tcp' | 'udp'
        });
      }

      if (closedConnectionInfo) {
        this.connections.filter(
          (connection: connection) =>
            connection.ip !== closedConnectionInfo[1] &&
            connection.type !== closedConnectionInfo[2]
        );
      }
    });
  }

  private async fetch(
    url: string = isRequired('URL'),
    data: fetch.FetchOptions = {}
  ): Promise<any> {
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

function isRequired(argumentName: string): any {
  // If A Required Argument Isn't Provided, Throw An Error
  throw new TypeError(`${argumentName} is a required argument.`);
}

export default async (playitOpts: any = {}) =>
  await new PlayIt().create(playitOpts);

export interface tunnelOpts {
  proto?: string;
  port: number;
}

export interface tunnel {
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

export interface binaries {
  win: string;
  lin: string;
  mac: string;
  arm: string;
  aarch: string;
}

export interface connection {
  ip: string;
  tunnel: tunnel;
  type: 'tcp' | 'udp';
}

export type os = 'win' | 'mac' | 'lin';
