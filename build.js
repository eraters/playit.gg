import caxa from 'caxa';
import fs from 'fs-extra';
import { icon } from 'changeexe';
import { resolve } from 'node:path';
import { PlayIt } from './dist/index.js';

const { os, type, version } = new PlayIt();

(async () => {
  __dirname = resolve(__dirname, '..');
  let output = `${__dirname}/bin/playit-${type}-${version}.${
    os === 'win' ? 'exe' : 'sh'
  }`;

  await caxa.default({
    input: __dirname,
    output,
    command: [
      '{{caxa}}/node_modules/.bin/node',
      '--unhandled-rejections=strict',
      '{{caxa}}/cli.js'
    ],
    dedupe: true,
    uncompressionMessage:
      'May Take Extra Time To Start On First Run, Please Wait...'
  });

  if (await fs.pathExists(output)) {
    os === 'win' && icon(output, `${__dirname}/playit-icon.ico`);

    console.log(`Built PlayIt To ${output}`);
  } else {
    throw new Error('Failed To Build PlayIt');
  }
})();
