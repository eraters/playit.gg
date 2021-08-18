const PlayIt = require('.');
const { createServer } = require('http'); // Ignore this, this is to test the tunnel

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

  console.log(`http://${tunnel.url}`);
})();
