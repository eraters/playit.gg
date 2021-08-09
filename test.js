const PlayIt = require('.');

(async () => {
  const playit = await new PlayIt();

  console.log(await playit.createTunnel());
})();
