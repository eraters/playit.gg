#!/usr/bin/env node

const { PlayIt } = require('.');

const program = new (require('commander').Command)();
let playit = new PlayIt();

(async () => {
  program
    .version(playit.version)
    .name('PlayIt')
    .usage('--tunnels <Port:Proto...>')
    .requiredOption(
      '-t, --tunnels <Port:Proto...>',
      'tunnels to create with the specified port and prototype'
    )
    .option('-e, --envs <Name:Value...>', 'environment options for playit')
    .parse();

  const opts = program.opts();

  opts.tunnels = opts.tunnels.map((tunnel) => ({
    port: Number(tunnel.split(':')[0]),
    proto: tunnel.split(':')[1]
  }));

  opts.env = opts.envs
    ? opts.envs.map((env) => ({
        name: env.split(':')[0],
        value: env.split(':')[1]
      }))
    : [];

  console.log(opts);

  for (const tunnel of opts.tunnels) {
    if (!['udp', 'tcp'].includes(tunnel.proto.toLowerCase()))
      throw new Error('the prototype must be either UDP, or TCP');

    if (
      !(
        !isNaN(Number(tunnel.port)) &&
        Number(tunnel.port) <= 65353 &&
        Number(tunnel.port) > 0
      )
    )
      throw new Error(
        'the port must be a valid integer, and between 1 and 65353'
      );

    if (tunnel.port === undefined) return program.showHelpAfterError();
    else if (tunnel.proto === undefined) tunnel.proto = 'tcp';
  }

  playit = await playit.create();
  playit.onError(console.error);
  playit.onWarning(console.warn);

  for (const tunnel of opts.tunnels) {
    console.log(
      `http://${(await playit.createTunnel(tunnel)).url} : ${tunnel.port}:${
        tunnel.proto
      }`
    );
  }
})();
