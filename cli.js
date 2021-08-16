const PlayIt = require('.');
const { Command, Option, Argument } = require('commander');

const program = new Command();

(async () => {
  const playit = await PlayIt();

  await program
    .version(playit.version)
    .name('PlayIt.GG')
    .usage('[Network Prototype] [Port]')
    .addArgument(new Argument('[Network Prototype]').choices(['udp', 'tcp']))
    .addArgument(new Argument('[Port]'))
    .parseAsync();
})();
