import PlayIt from './dist/index.js';
import { createServer } from 'node:http'; // Ignore this, this is to test the tunnel
import fetch from 'make-fetch-happen';

(async () => {
  const playit = await PlayIt();

  const tunnel = await playit.createTunnel({ proto: 'tcp', port: 8080 });

  // Ignore this, this just creates a webserver to test the tunnel
  createServer((_, res) => {
    res.write(
      "<h1>It Works!</h1><br/><p>If You're Reading This, Then PlayIt Works!</p>"
    );
    res.end();
  }).listen(8080);

  playit.onError(console.error);
  playit.onWarning(console.warn);

  console.log(`http://${tunnel.url}`);

  await (async (res) => {
    let result = false;

    console.time('tunnelOn');

    do {
      try {
        await fetch(`http://${tunnel.url}`);
        result = true;
        console.timeEnd('tunnelOn');
        res(null);
      } catch {}
    } while (!result);
  })();

  process.argv[2] && setTimeout(process.exit, parseInt(process.argv[2]) * 1000);
})();
