#!/usr/bin/env node

'use strict';

const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const spawn = require('child_process').spawn;
const fs = require('fs');
const log = require('./utils/log');
const exitHook = require('exit-hook');
const quit = require('./utils/quit');

class playit {
    constructor(opts) {
        let { email, password, token } = opts || {};
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
            if (
                !['x64', 'arm', 'arm64', 'ppc64', 's390x'].includes(
                    process.arch
                )
            )
                throw new Error('Unsupported Architecture!');
            else this.arch = process.arch;

            // Start Puppeteer
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            // Login
            token
                ? await this.loginWithToken(token)
                : email && password
                ? await this.login(email, password)
                : quit(
                    new Error(
                        'You Must Provide The Username And Password, Or A Token'
                    )
                );

            // Start PlayIt
            await this.start();
            return this;
        })();
    }

    async loginWithToken(token = isRequired('token')) {
        // Create A New Page
        const page = await this.browser.newPage();
        // Goto The Oauth URI
        await page.goto(
            'https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fresponse_type%3Dtoken%26client_id%3D705634226527141919%26redirect_uri%3Dhttps%253A%252F%252Fplayit.gg%252Foauth%252Fdiscord%26scope%3Didentify'
        );

        await page.waitForSelector(
            'input[name="password"], input[name="email"], button[type="submit"]'
        );

        // Login To Discord With A Token
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

        // Get The Session Token, Stored In The localStorage
        const session = await page.evaluate(() =>
            window.localStorage.getItem('session')
        );

        // Close The Page
        await page.close();

        this.session = session;

        log('Logged In, Session Id:', session);
    }

    async login(
        email = isRequired('email'),
        password = isRequired('password')
    ) {
        // Create A New Page
        const page = await this.browser.newPage();
        // Goto The Oauth URI
        await page.goto(
            'https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fresponse_type%3Dtoken%26client_id%3D705634226527141919%26redirect_uri%3Dhttps%253A%252F%252Fplayit.gg%252Foauth%252Fdiscord%26scope%3Didentify'
        );

        await page.waitForSelector(
            'input[name="password"], input[name="email"], button[type="submit"]'
        );

        // Login To Discord With The Provided Email And Password
        await page.type('input[name="email"]', email);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForSelector('button[type="button"]:nth-of-type(2)');
        await page.click('button[type="button"]:nth-of-type(2)');

        await page.waitForNavigation();

        // Get The Session Token, Stored In The localStorage
        const session = await page.evaluate(() =>
            window.localStorage.getItem('session')
        );

        // Close The Page
        await page.close();

        this.session = session;

        log('Logged In, Session Id:', session);
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
                                        authorization: `session ${this.session}`,
                                    },
                                })
                            ).json()
                        ).agents.filter(
                            (agent) => agent.key === this.agent_key
                        )[0].id,
                        domain_id: null,
                    }),
                    headers: {
                        authorization: `session ${this.session}`,
                    },
                })
            ).json()
        ).id;

        // Get More Data About The Tunnel
        let otherData = (
            await (
                await fetch(`${api}/account/tunnels`, {
                    headers: {
                        authorization: `session ${this.session}`,
                    },
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
                            authorization: `session ${this.session}`,
                        },
                    })
                ).json()
            ).tunnels.filter((tunnel) => tunnel.id === tunnelId)[0];
        }

        return otherData;
    }

    async claimUrl(url = isRequired('URL')) {
        // Create A New Page
        const page = await this.browser.newPage();

        // Go To The Claim URL
        await page.goto(url);

        log('Claimed URL:', url);
        return url;
    }

    async start(opts) {
        let { claim = true, playitOpts = { NO_BROWSER: true } } = opts || {};
        this.started = true;
        let url;
        playitOpts.NO_BROWSER = true;

        // Put The Options Into A .env File
        Object.entries(playitOpts).map(([opt, value]) =>
            fs.writeFileSync('.env', `${opt}=${value}`)
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
            }`, {
                cwd: __dirname,
                encoding: 'utf8',
            }
        );

        // If The User Wants To Automagically Claim The URI Provided By PlayIt
        // Then Claim The URI, And Return It
        // Else, We Just Return The URI
        if (claim === true)
            url = await new Promise((resolve) =>
                this.playit.stderr.on('data', (data) =>
                    data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
                    ? resolve(
                        this.claimUrl(
                            data
                            .toString()
                            .match(/https:\/\/[0-9a-z\.\/]*/gi)[0]
                        )
                    )
                    : ''
                )
            );
        else
            url = await new Promise((resolve) =>
                this.playit.stderr.on('data', (data) =>
                    data.toString().match(/\bhttps:\/\/[0-9a-z\/]*/gi)
                    ? resolve(
                        data
                        .toString()
                        .match(/https:\/\/[0-9a-z\.\/]*/gi)[0]
                    )
                    : ''
                )
            );
        this.playit.on('exit', () => {
            log(`PlayIt Exited`);
        });
        
        return url;
    }

    async stop() {
        this.destoyed = true;
        // Close The Browser
        await this.browser.close();
        // Kill The PlayIt Binary
        this.playit.kill('SIGINT');
        log(`Stopped`);
        return;
    }
}

function isRequired(argumentName) {
    // If A Required Argument Isn't Provided, Throw An Error
    throw new TypeError(`${argumentName} is a required argument.`);
}

module.exports = playit;
