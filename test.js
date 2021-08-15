const PlayIt = require('.');
const { createServer } = require('http');

(async () => {
  const playit = await PlayIt();

  const tunnel = await playit.createTunnel({ port: 8080 });

  createServer((_, res) => {
    res.write(
      "<h1>It Works!</h1><br/><p>If You're Reading This, Then PlayIt Works!</p>"
    );
    res.end();
  }).listen(8080);

  console.log(`http://${tunnel.url}`);
})();
