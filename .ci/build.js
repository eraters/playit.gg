const { exec: pkg } = require('pkg');
const { PlayIt } = require('../dist');
const { icon, versionInfo } = require('changeexe');
const { resolve, basename } = require('path');
const { need } = require('pkg-fetch');
const { rename } = require('fs-extra');

const { os, type, arch, version } = new PlayIt();

__dirname = resolve(__dirname, '..');

const output = `${__dirname}/bin/playit-${type}-${version}`;

(async () => {
  const cachePath = await downloadCache(`node16-${os}-${arch}`);

  if (os === 'win') {
    await icon(cachePath, `${__dirname}/.ci/playit-icon.ico`);
    await versionInfo(cachePath, {
      ProductName: 'PlayIt.GG',
      OriginalFilename: `${basename(output)}.exe`,
      ProductVersion: `1,${version}`
    });

    await rename(cachePath, cachePath.replace(/fetched(?!.*fetched)/, 'built'));
  }

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
  ]);
})();

async function downloadCache(pkgTarget) {
  const [nodeRange, platform, arch] = pkgTarget.split('-');
  return await need({ nodeRange, platform, arch });
}
