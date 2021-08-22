import caxa from 'caxa';
import { PlayIt } from './dist/ts.js';

const os = new PlayIt().os;

(async () => {
  const output = `bin/playit.${
    os === 'win' ? 'exe' : os === 'mac' ? 'app' : 'lin'
  }`;
  await caxa.default({
    input: '.',
    output,
    command: ['{{caxa}}/node_modules/.bin/node', '{{caxa}}/cli.js']
  });
  console.log(`Built PlayIt To ${output}`);
})();
