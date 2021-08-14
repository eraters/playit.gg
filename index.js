#!/usr/bin/env node

'use strict';

const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
const fs = require('fs');
const exitHook = require('async-exit-hook');

class playit {
  tunnels = [];
  os =
    process.platform === 'win32'
      ? 'win'
      : process.platform === 'darwin'
      ? 'mac'
      : 'lin';

  arch = (() => {
    if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
      throw new Error('Unsupported Architecture!');
    else this.arch = process.arch;
  })();

  ready = false;

  constructor(playitOpts = {}, plugin = () => {}) {
    // On Exit, Stop PlayIt
    exitHook((callback) => {
      if (this.destroyed) callback();
      this.stop().then(() => callback());
    });
    (async () => {
      // Start PlayIt
      await this.start({ claim: true, playitOpts });

      this.plugin = plugin(this);

      this.ready = true;
    })();

    while (!this.ready);

    return this;
  }

  async disableTunnel(id) {
    await (await this.fetch(`/account/tunnels/${id}/disable`)).json();
  }

  async enableTunnel(id) {
    await (await this.fetch(`/account/tunnels/${id}/enable`)).json();
  }

  async createTunnel(opts) {
    let { proto = 'TCP', port = 80 } = opts || {};

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
            local_proto: proto.replace(/./g, (m, o) =>
              o === 0 ? m.toUpperCase() : m.toLowerCase()
            ),
            agent_id: (
              await (await this.fetch('/account/agents')).json()
            ).agents.find((agent) => agent.key === this.agent.agent_key).id,
            domain_id: null
          })
        })
      ).json()
    ).id;

    // Get More Data About The Tunnel
    let otherData = (
      await (await this.fetch('/account/tunnels')).json()
    ).tunnels.find((tunnel) => tunnel.id === tunnelId);

    while (otherData.domain_id === null || otherData.connect_address === null) {
      let time = new Date().getTime();
      while (new Date().getTime() < time + 1000);
      otherData = (
        await (await this.fetch('/account/tunnels')).json()
      ).tunnels.find((tunnel) => tunnel.id === tunnelId);
    }

    otherData.url = otherData.connect_address;

    this.tunnels.push(otherData);

    return otherData;
  }

  async claimUrl(url = isRequired('URL')) {
    await this.fetch(url);

    return url;
  }

  async start(opts) {
    let { claim = true, playitOpts = {} } = opts || {};
    this.started = true;
    playitOpts.NO_BROWSER = true;
    let url;

    const dotenvStream = fs.createWriteStream(`${__dirname}/.env`, {
      flags: 'w+'
    });

    // Put The Options Into The .env File
    for (const [opt, value] of Object.entries(playitOpts)) {
      await new Promise((res, rej) =>
        dotenvStream.write(`${opt}=${value}\n`, (err) =>
          err ? rej(err) : res(undefined)
        )
      );
    }

    // If A Previous Config File Exists, Remove It
    if (
      fs.existsSync(
        this.os === 'lin' || this.os === 'mac'
          ? `${require('os').homedir()}/.config/playit/config.json`
          : `${process.env.AppData}/playit/config.json`
      )
    )
      fs.rmSync(
        this.os === 'lin' || this.os === 'mac'
          ? `${require('os').homedir()}/.config/playit/config.json`
          : `${process.env.AppData}/playit/config.json`
      );

    fs.chmodSync(
      `${__dirname}/binaries/playit.${
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
      100
    );

    // Spawn The PlayIt Binary
    this.playit = spawn(
      `${__dirname}/binaries/playit.${
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
      this.playit.stderr.on('data', (data) =>
        data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
          ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
          : ''
      )
    );

    this.agent = JSON.parse(
      fs.readFileSync(
        this.os === 'lin' || this.os === 'mac'
          ? `${require('os').homedir()}/.config/playit/config.json`
          : `${process.env.AppData}/playit/config.json`
      )
    );

    if (claim === true) this.claimUrl(url);

    return url;
  }

  async stop() {
    this.destroyed = true;
    // Kill The PlayIt Binary
    this.playit.kill('SIGINT');
    return;
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
        headers: { authorization: `agent ${(this, this.agent.agent_key)}` }
      });
    else
      return await fetch(`https://api.playit.gg/${url}`, {
        ...data,
        headers: { authorization: `agent ${(this, this.agent.agent_key)}` }
      });
  }
}

function isRequired(argumentName) {
  // If A Required Argument Isn't Provided, Throw An Error
  throw new TypeError(`${argumentName} is a required argument.`);
}

module.exports = playit;
