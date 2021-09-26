const { exec: pkg } = require('pkg');
const { PlayIt } = require('../dist');
const { icon } = require('changeexe');

const { os, type, arch, version } = new PlayIt();

__dirname = require('path').resolve(__dirname, '..');

const targets = [`${os}-${arch}`];
const nodeOptions = [];
const assets = [];
const output = `${__dirname}/bin/playit-${type}-${version}`;

(async () => {
  await pkg([
    __dirname,
    '--public-packages',
    '*',
    '--no-bytecode',
    '--public',
    '--output',
    output,
    '--targets',
    targets.map((target) => `node16-${target}`).join(','),
    '--options',
    nodeOptions.join(','),
    '--assets',
    assets.join(',')
  ]);

  if (os === 'win') icon(`${output}.exe`, `${__dirname}/.ci/playit-icon.ico`);
})();
