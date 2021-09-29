const PlayIt = require('.');
const { createServer } = require('http');
const fetch = require('make-fetch-happen');

(async () => {
  process.argv[2] && setTimeout(process.exit, parseInt(process.argv[2]) * 1000);

  const playit = await PlayIt();

  const tunnel = await playit.createTunnel({ proto: 'tcp', port: 8080 });
  console.time('\nTunnel Active');

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

  await (async () => {
    while (true) {
      try {
        if (
          (await (await fetch(`http://${tunnel.url}`)).text()).includes(
            'It Works!'
          )
        )
          break;
      } catch {}
    }
    console.timeEnd('\nTunnel Active');
  })();
})();
