import caxa from 'caxa';
import { playit as PlayIt } from './dist/ts.js';

const os = new PlayIt().os;

(async () => {
  const output = `bin/${
    os === 'win' ? 'playit.exe' : os === 'mac' ? 'playit.app' : 'playit.lin'
  }`;
  await caxa.default({
    input: '.',
    output,
    command: ['{{caxa}}/node_modules/.bin/node', '{{caxa}}/test.js']
  });
  console.log(`Built PlayIt To ${output}`);
})();
