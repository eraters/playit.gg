import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import {
  mkdirpSync,
  createWriteStream,
  pathExists,
  rm,
  chmod,
  readFile,
  writeFile
} from 'fs-extra';
import fetch from 'make-fetch-happen';
import { tmpdir, homedir } from 'os';
import { Open as zip } from 'unzipper';

/**  @class */
export class PlayIt {
  /**
   * @description Whether PlayIt Has Been Stopped
   */
  destroyed: Boolean = false;

  /**
   * @description The Architexture Of The Current System
   */
  arch: 'x64' | 'arm' | 'arm64' = (() => {
    // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
    if (!['x64', 'arm', 'arm64'].includes(process.arch))
      throw new Error(`Unsupported Architecture, ${process.arch}!`);

    return process.arch as 'x64' | 'arm' | 'arm64';
  })();

  /**
   * @description The Directory That PlayIt Is Running In
   */
  dir: string = (() => {
    const dir = `${tmpdir()}/playit`;
    mkdirpSync(dir);
    return dir;
  })();

  /**
   * @description Tunnels Created
   */
  tunnels: tunnel[] = [];
  /**
   * @description The Key Of The Agent
   */
  agent_key: string = '';
  /**
   * @description Whether PlayIt Has Been Started
   */
  started: Boolean = false;
  /**
   * @description The PlayIt Child Process
   */
  playit: ChildProcessWithoutNullStreams | undefined = undefined;
  /**
   * @description The Tunnel PlayIt Is Using
   */
  tunnel: string = '';
  /**
   * @description The Packets PlayIt Has Used
   */
  used_packets: number = 0;
  /**
   * @description The Packets PlayIt Has Not Used
   */
  free_packets: number = 0;
  /**
   * @description The Connections, **THIS IS A WIP**
   */
  connections: connection[] = [];

  /**
   * @description The Operating System Of The Current System
   */
  os: os =
    process.platform === 'win32'
      ? 'win'
      : process.platform === 'darwin'
      ? 'mac'
      : 'lin';

  /**
   * @description The Version Of PlayIt Being Used
   */
  version: string = '0.4.6';

  /**
   * @description The Configuration File Of PlayIt
   */
  configFile: string =
    this.os === 'win'
      ? `${process.env.AppData}/playit/config.json`
      : this.os === 'mac'
      ? `${homedir()}/Library/Application Support/playit/config.json`
      : `${homedir()}/.config/playit/config.json`;

  /**
   * @description The Download URLs For PlayIt
   */
  downloadUrls: binaries = {
    win: `https://playit.gg/downloads/playit-win_64-${this.version}.exe`,
    lin: `https://playit.gg/downloads/playit-linux_64-${this.version}`,
    mac: `https://playit.gg/downloads/playit-darwin_64-${this.version}.zip`,
    arm: `https://playit.gg/downloads/playit-armv7-${this.version}`,
    arm64: `https://playit.gg/downloads/playit-aarch64-${this.version}`
  };

  /**
   * @description The Downloaded Type Of PlayIt
   */
  type: 'arm' | 'mac' | 'win' | 'lin' | 'arm64' =
    this.os === 'win'
      ? 'win'
      : this.os === 'mac'
      ? 'mac'
      : this.os === 'lin' && this.arch === 'arm'
      ? 'arm'
      : this.os === 'lin' && this.arch === 'arm64'
      ? 'arm64'
      : 'lin';

  /**
   * @description The Path To The Downloaded Binary
   */
  binary: string | undefined = undefined;

  /**
   * @description The Output Of PlayIt
   */
  output: string[] = [];
  /**
   * @description The Stdout Ouput Of PlayIt
   */
  stdout: string[] = [];
  /**
   * @description The Stderr Ouput Of PlayIt
   */
  stderr: string[] = [];
  /**
   * @description The Errors Of PlayIt
   */
  errors: string[] = [];
  /**
   * @description The Warnings Of PlayIt
   */
  warnings: string[] = [];
  /**
   * @description An Output Callback For PlayIt
   * @param
   */
  onOutput: Function | undefined = undefined;
  /**
   * @param {Function} callback - The Callback To Call When PlayIt Outputs Something In Stdout
   * @description The Stderr Callback For PlayIt
   * @returns {void}
   */
  onStdout: (callback: Function) => void | undefined = undefined;
  /**
   * @param {Function} callback - The Callback To Call When PlayIt Outputs Something In Stderr
   * @description The Stderr Callback For PlayIt
   * @returns {void}
   */
  onStderr: (callback: Function) => void | undefined = undefined;
  /**
   * @param {Function} callback - The Callback To Call When PlayIt Outputs An Error
   * @description The Stderr Callback For PlayIt
   * @returns {void}
   */
  onError: (callback: Function) => void | undefined = undefined;
  /**
   * @param {Function} callback - The Callback To Call When PlayIt Outputs A Warning
   * @description The Stderr Callback For PlayIt
   * @returns {void}
   */
  onWarning: (callback: Function) => void | undefined = undefined;

  constructor() {
    process.chdir(this.dir);
  }

  /**
   * @param {number} id - The Tunnel ID
   * @description Disables The Specified Tunnel
   * @example
   * await playit.disableTunnel(<Tunnel ID>);
   */
  public async disableTunnel(id: number): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/disable`);
  }

  /**
   * @param {number} id - The Tunnel ID
   * @description Enables The Specified Tunnel
   * @example
   * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
   * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
   */
  public async enableTunnel(id: number): Promise<void> {
    await this.fetch(`/account/tunnels/${id}/enable`);
  }

  /**
   * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
   * @description Creates A Tunnel With The Specified Port And Protocall
   * @example
   * const tunnel = await playit.createTunnel({ port: <Port>, proto: <Network Protocall> });
   * console.log(tunnel.url);
   */
  public async createTunnel(tunnelOpts: tunnelOpts): Promise<tunnel> {
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
        await new Promise((res) => setTimeout(res, 5000));
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

  private async claimUrl(url: string): Promise<void> {
    await this.fetch(url);
  }

  /**
   * @param {any} playitOpts - Options To Put Into The `.env` File
   * @description Starts PlayIt
   * @example
   * import { PlayIt } from 'playit.gg';
   * const playit = await new PlayIt.create(<Options For Playit>);
   */
  public async start(playitOpts: any = {}): Promise<PlayIt> {
    if (this.started) return this;

    this.started = true;
    playitOpts.NO_BROWSER = true;
    let outputCallbacks: Function[] = [],
      stderrCallbacks: Function[] = [],
      stdoutCallbacks: Function[] = [],
      errorCallbacks: Function[] = [],
      warningCallbacks: Function[] = [];

    this.binary = await this.download();

    const dotenvStream = createWriteStream(`${this.dir}/.env`, {
      flags: 'w+'
    });

    for (const [opt, value] of Object.entries(playitOpts))
      await new Promise((res, rej) =>
        dotenvStream.write(`${opt}=${value}\n`, (err) =>
          err ? rej(err) : res(null)
        )
      );

    dotenvStream.end();

    if (await pathExists(this.configFile)) await rm(this.configFile);

    await chmod(this.binary, 0o555);

    // Spawn The PlayIt Binary
    this.playit = spawn(this.binary, {
      cwd: this.dir
    });

    this.playit.stdout.on('data', (data: Buffer) => {
      this.output.push(`${data}\n`);
      this.stdout.push(`${data}\n`);
      outputCallbacks.map((callback) => callback(data.toString()));
      stdoutCallbacks.map((callback) => callback(data.toString()));
    });
    this.playit.stderr.on('data', (data: Buffer) => {
      this.output.push(`${data}\n`);
      this.stderr.push(`${data}\n`);
      outputCallbacks.map((callback) => callback(data.toString()));
      stderrCallbacks.map((callback) => callback(data.toString()));
      if (data.toString().includes('ERRO')) {
        this.errors.push(`${data}\n`);
        errorCallbacks.map((callback) => callback(data.toString()));
      } else if (data.toString().includes('WARN')) {
        this.warnings.push(`${data}\n`);
        warningCallbacks.map((callback) => callback(data.toString()));
      }
    });

    this.onOutput = (callback: Function = (output: string) => output) => {
      callback(this.output.join('\n'));
      outputCallbacks.push(callback);
    };

    this.onStdout = (callback: Function) => {
      callback(this.stdout.join('\n'));
      stdoutCallbacks.push(callback);
    };

    this.onStderr = (callback: Function = (output: string) => output) => {
      callback(this.stderr.join('\n'));
      stderrCallbacks.push(callback);
    };

    this.onError = (callback: Function = (output: string) => output) => {
      callback(this.errors.join('\n'));
      errorCallbacks.push(callback);
    };

    this.onWarning = (callback: Function = (output: string) => output) => {
      callback(this.warnings.join('\n'));
      warningCallbacks.push(callback);
    };

    this.parseOutput();

    await (async () => {
      while (!(await pathExists(this.configFile)));
    })();

    Object.assign(this, JSON.parse(await readFile(this.configFile, 'utf-8')));

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
  }

  private async download(): Promise<string> {
    let file = `${this.dir}/playit-${this.type}-${this.version}.${
      this.os === 'win' ? 'exe' : 'bin'
    }`;

    if (await pathExists(file)) return file;

    if (this.os === 'mac') {
      await Promise.all(
        (
          await zip.buffer(
            Buffer.from(
              await (await fetch(this.downloadUrls[this.type])).arrayBuffer()
            )
          )
        ).files.map(
          async (zipFile) =>
            zipFile.path.includes('playit') &&
            zipFile.type === 'File' &&
            (await writeFile(file, await zipFile.buffer()))
        )
      );
    } else {
      await writeFile(
        file,
        Buffer.from(
          await (await fetch(this.downloadUrls[this.type])).arrayBuffer()
        )
      );
    }

    return file;
  }

  private async parseOutput() {
    await this.claimUrl(
      await new Promise((res) =>
        this.onStderr((data: string) =>
          data.match(/https:\/\/[0-9a-z\.\/]*/gi)?.[0]
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
    url: string,
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

export default async function init(playitOpts: any = {}) {
  return await new PlayIt().start(playitOpts);
}

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
  arm64: string;
}

export interface connection {
  ip: string;
  tunnel: tunnel;
  type: 'tcp' | 'udp';
}

export interface playitEnv {
  PREFERRED_TUNNEL?:
    | 'dal4'
    | 'sol4'
    | 'syd4'
    | 'mum4'
    | 'sf4'
    | 'fnk4'
    | 'bng4'
    | 'sng4'
    | 'tor4'
    | 'ny4'
    | 'uk4'
    | 'saw4'
    | 'turk4'
    | 'san4'
    | 'pet4'
    | 'bur4'
    | 'new4'
    | 'isr4'
    | 'tko4'
    | 'syd5'
    | 'sng5'
    | 'hel4'
    | 'fal4';

  PREFERRED_THRESHOLD?: number;

  NO_BROWSER?: true;

  NO_SPECIAL_LAN?: boolean;
}

export type os = 'win' | 'mac' | 'lin';

module.exports = Object.assign(init, module.exports);
