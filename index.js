#!/usr/bin/env node

'use strict';

const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
const fs = require('fs');
const exitHook = require('exit-hook');

class playit {
  constructor() {
    // On Exit, Stop PlayIt
    exitHook((_, callback) => {
      if (this.destroyed) callback;
      this.stop().then(() => callback);
    });
    return (async () => {
      // Get Os
      this.os =
        process.platform === 'win32'
          ? 'win'
          : process.platform === 'darwin'
          ? 'mac'
          : 'lin';
      // Check If Architexture is x64 Or Arm, If It Isn't, Throw An Error
      if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
        throw new Error('Unsupported Architecture!');
      else this.arch = process.arch;

      // Start PlayIt
      await this.start();

      return this;
    })();
  }

  async createTunnel(opts) {
    let { proto = 'TCP', port = 80 } = opts || {};

    const api = 'https://api.playit.gg';
    // Create The Tunnel, And Get The Id
    const tunnelId = (
      await (
        await fetch(`${api}/account/tunnels`, {
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
              await (
                await fetch(`${api}/account/agents`, {
                  headers: {
                    authorization: `agent ${this.agent.agent_key}`
                  }
                })
              ).json()
            ).agents.find((agent) => agent.key === this.agent.agent_key).id,
            domain_id: null
          }),
          headers: {
            authorization: `agent ${this.agent.agent_key}`
          }
        })
      ).json()
    ).id;

    // Get More Data About The Tunnel
    let otherData = (
      await (
        await fetch(`${api}/account/tunnels`, {
          headers: {
            authorization: `agent ${this.agent.agent_key}`
          }
        })
      ).json()
    ).tunnels.find((tunnel) => tunnel.id === tunnelId);

    while (otherData.domain_id === null || otherData.connect_address === null) {
      let time = new Date().getTime();
      while (new Date().getTime() < time + 1000);
      otherData = (
        await (
          await fetch(`${api}/account/tunnels`, {
            headers: {
              authorization: `agent ${this.agent.agent_key}`
            }
          })
        ).json()
      ).tunnels.find((tunnel) => tunnel.id === tunnelId);
    }

    otherData.url = otherData.connect_address;
    return otherData;
  }

  async claimUrl(url = isRequired('URL')) {
    await fetch(url, {
      headers: {
        authorization: `agent ${this.agent.agent_key}`
      }
    });

    return url;
  }

  async start(opts) {
    let { claim = true, playitOpts = { NO_BROWSER: true } } = opts || {};
    this.started = true;
    let url;
    playitOpts.NO_BROWSER = true;

    // Put The Options Into A .env File
    Object.entries(playitOpts).map(([opt, value]) =>
      fs.writeFileSync(`${__dirname}/.env`, `${opt}=${value}`)
    );

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
    this.destoyed = true;
    // Kill The PlayIt Binary
    this.playit.kill('SIGINT');
    return;
  }
}

function isRequired(argumentName) {
  // If A Required Argument Isn't Provided, Throw An Error
  throw new TypeError(`${argumentName} is a required argument.`);
}

module.exports = playit;
