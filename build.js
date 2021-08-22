import caxa from 'caxa';
import { playit as PlayIt } from './dist/ts.js';

const os = new PlayIt().os;

(async () => {
  await caxa({
    input: '.',
    output:
      os === 'win' ? 'playit.exe' : os === 'mac' ? 'playit.mac' : 'playit.lin',
    command: ['{{caxa}}/node_modules/.bin/node', '{{caxa}}/dist/ts.js']
  });
})();
