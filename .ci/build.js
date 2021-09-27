const { exec: pkg } = require('pkg');
const { PlayIt } = require('..');
const { resolve } = require('path');

const { os, type, arch, version } = new PlayIt();

__dirname = resolve(__dirname, '..');

const output = `${__dirname}/bin/playit-${type}-${version}`;

(async () =>
  await pkg([
    __dirname,
    '--public-packages',
    '*',
    '--no-bytecode',
    '--public',
    '--output',
    output,
    '--targets',
    `node16-${os}-${arch}`
  ]))();
