const PlayIt = require('.');
const { createServer } = require('http');

(async () => {
  const playit = new PlayIt();

  const tunnel = await playit.createTunnel({ port: 8080 });

  createServer((_, res) => {
    res.write('<h1>It Works!</h1><br/>');
  }).listen(8080);

  console.log(tunnel.url);
})();
