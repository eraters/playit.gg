import caxa from 'caxa';
import { playit as PlayIt } from './dist/ts.js';

const os = new PlayIt().os;

(async () =>
  await caxa.default({
    input: '.',
    output: `bin/${
      os === 'win' ? 'playit.exe' : os === 'mac' ? 'playit.app' : 'playit.lin'
    }`,
    command: ['{{caxa}}/node_modules/.bin/node', '{{caxa}}/test.js']
  }))();
