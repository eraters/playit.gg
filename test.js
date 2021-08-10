const PlayIt = require('.');
const fs = require('fs');

(async () => {
  const playit = await new PlayIt();

  const tunnel = await playit.createTunnel();

  console.log(tunnel.url);
  fs.writeFileSync('url', tunnel.url);
  await playit.stop();
})();
