#!/usr/bin/env node

'use strict';

const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const spawn = require('child_process').spawn;
const fs = require('fs');
const log = require('./utils/log');
const exitHook = require('exit-hook');

class playit {
  constructor(opts) {
    let { email, password, token } = opts || {};
    exitHook((_, callback) => {
      if (this.destroyed) callback;
      this.stop().then(() => callback);
    });
    return (async () => {
      this.os =
        process.platform === 'win32'
          ? 'win'
          : process.platform === 'darwin'
          ? 'mac'
          : 'lin';
      if (!['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(process.arch))
        throw new Error('Unsupported Architecture!');
      else this.arch = process.arch;

      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      token
        ? await this.loginWithToken(token)
        : await this.login(email, password);

      await this.start();
      return this;
    })();
  }

  async loginWithToken(token = isRequired('token')) {
    const page = await this.browser.newPage();
    await page.goto(
      'https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fresponse_type%3Dtoken%26client_id%3D705634226527141919%26redirect_uri%3Dhttps%253A%252F%252Fplayit.gg%252Foauth%252Fdiscord%26scope%3Didentify'
    );

    await page.waitForSelector(
      'input[name="password"], input[name="email"], button[type="submit"]'
    );

    await page.evaluate((token) => {
      // Alteration of https://gist.github.com/m-Phoenix852/b47fffb0fd579bc210420cedbda30b61
      setInterval(() => {
        window.document.body.appendChild(
          window.document.createElement('iframe')
        ).contentWindow.localStorage.token = `"${token}"`;
      }, 50);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }, token);

    await page.waitForSelector('button[type="button"]:nth-of-type(2)');
    await page.click('button[type="button"]:nth-of-type(2)');

    await page.waitForNavigation();

    const session = await page.evaluate(() =>
      window.localStorage.getItem('session')
    );

    await page.close();

    this.session = session;

    log('Logged In, Session Id:', session);
  }

  async login(email = isRequired('email'), password = isRequired('password')) {
    const page = await this.browser.newPage();
    await page.goto(
      'https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fresponse_type%3Dtoken%26client_id%3D705634226527141919%26redirect_uri%3Dhttps%253A%252F%252Fplayit.gg%252Foauth%252Fdiscord%26scope%3Didentify'
    );

    await page.waitForSelector(
      'input[name="password"], input[name="email"], button[type="submit"]'
    );

    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForSelector('button[type="button"]:nth-of-type(2)');
    await page.click('button[type="button"]:nth-of-type(2)');

    await page.waitForNavigation();

    const session = await page.evaluate(() =>
      window.localStorage.getItem('session')
    );

    await page.close();

    this.session = session;

    log('Logged In, Session Id:', session);
  }

  async createTunnel(opts) {
    let { type = 'TCP', port = 80, session = this.session } = opts || {};

    const api = 'https://api.playit.gg';
    const tunnelId = (
      await (
        await fetch(`${api}/account/tunnels`, {
          method: 'POST',
          body: JSON.stringify({
            id: null,
            game: `custom-${type.toLowerCase()}`,
            local_port: port,
            local_ip: '127.0.0.1',
            local_proto: type.replace(/./g, (m, o) =>
              o === 0 ? m.toUpperCase() : m.toLowerCase()
            ),
            agent_id: (
              await (
                await fetch(`${api}/account/agents`, {
                  headers: {
                    authorization: `session ${session}`
                  }
                })
              ).json()
            ).agents.filter((agent) => agent.key === this.agent_key)[0].id,
            domain_id: null
          }),
          headers: {
            authorization: `session ${session}`
          }
        })
      ).json()
    ).id;

    let otherData = (
      await (
        await fetch(`${api}/account/tunnels`, {
          headers: {
            authorization: `session ${session}`
          }
        })
      ).json()
    ).tunnels.filter((tunnel) => tunnel.id === tunnelId)[0];

    while (otherData.status === 'Provisioning') {
      let time = new Date().getTime();
      while (new Date().getTime() < time + 1000);
      otherData = (
        await (
          await fetch(`${api}/account/tunnels`, {
            headers: {
              authorization: `session ${session}`
            }
          })
        ).json()
      ).tunnels.filter((tunnel) => tunnel.id === tunnelId)[0];
    }

    return otherData;
  }

  async claimUrl(url = isRequired('URL')) {
    const page = await this.browser.newPage();

    await page.goto(url);
    await page.waitForNavigation();
    await page.evaluate(() =>
      window.localStorage.setItem('session', this.session)
    );
    await page.reload({ waitUntil: ['domcontentloaded'] });

    log('Claimed URL:', url);
    return url;
  }

  async start(opts) {
    let { claim = true } = opts || {};
    this.started = true;
    var url = '';
    playitOpts.NO_BROWSER = true;

    Object.entries(playitOpts).map(([opt, value]) =>
      fs.writeFileSync('.env', `${opt}=${value}`)
    );

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

    if (claim === true)
      url = await new Promise((resolve) =>
        this.playit.stderr.on('data', (data) =>
          data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? resolve(
                this.claimUrl(
                  data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0]
                )
              )
            : ''
        )
      );
    else
      url = await new Promise((resolve) =>
        this.playit.stderr.on('data', (data) =>
          data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
            ? resolve(data.toString().match(/https:\/\/[0-9a-z\.\/]*/gi)[0])
            : ''
        )
      );
    this.playit.on('exit', () => {
      log(`PlayIt Exited`);
    });

    while (!url);
    return url;
  }

  async stop() {
    this.destoyed = true;
    await this.browser.close();
    this.playit.kill('SIGINT');
    log(`Stopped`);
    return;
  }
}

function isRequired(argumentName) {
  throw new TypeError(`${argumentName} is a required argument.`);
}

module.exports = playit;
