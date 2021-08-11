const PlayIt = require('.');

(async () => {
  const playit = await new PlayIt();

  const tunnel = await playit.createTunnel();

  console.log(tunnel.url);
  await playit.stop();
})();
