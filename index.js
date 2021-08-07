#!/usr/bin/env node

const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

class playit {
  constructor(email = isRequired('email'), password = isRequired('password')) {
    this.login(email, password);
  }

  async login(email = isRequired('email'), password = isRequired('password')) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
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

    await page.waitForNavigation('networkidle2');

    const session = await page.evaluate(() =>
      window.localStorage.getItem('session')
    );

    await browser.close();

    this.session = session;
  }

  async createTunnel({ type = 'TCP', port = 80, session = this.session }) {
    // {"id":null,"game":"custom-udp","local_port":1234,"local_ip":"127.0.0.1","local_proto":"Udp","agent_id":405688,"domain_id":null}
  }
}

function isRequired(argumentName) {
  throw new TypeError(`${argumentName} is a required argument.`);
}

module.exports = playit;
