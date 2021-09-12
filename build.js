import caxa from 'caxa';
import fs from 'fs-extra';
import { icon } from 'changeexe';
import { resolve } from 'node:path';
import { PlayIt } from './dist/index.js';
import glob from 'glob';

const { os } = new PlayIt();

(async () => {
  __dirname = resolve(__dirname, '..');
  let output = `${__dirname}/bin/${os}.${
    os === 'win' ? 'exe' : os === 'mac' ? 'app' : 'sh'
  }`;

  await caxa.default({
    input: __dirname,
    output,
    command: ['{{caxa}}/node_modules/.bin/node', '{{caxa}}/cli.js'],
    dedupe: true,
    uncompressionMessage:
      'May Take Extra Time To Start On First Run, Please Wait...'
  });

  if (await fs.pathExists(output)) {
    os === 'win'
      ? icon(output, `${__dirname}/playit-icon.ico`)
      : os === 'mac'
      ? await (async () => {
          const zip = new (require('adm-zip'))();
          zip.addLocalFolder(output);
          zip.writeZip(`${__dirname}/mac.zip`);
          console.log(zip.getEntries());
          await fs.rm(output, { recursive: true, force: true });
          output = `${__dirname}/mac.zip`;
        })()
      : '';

    console.log(`Built PlayIt To ${output}`);
  } else {
    throw new Error('Failed To Build PlayIt');
  }
})();
