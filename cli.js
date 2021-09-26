#!/usr/bin/env node

const { PlayIt } = require('.');
const prompt = require('prompts');

const program = new (require('commander').Command)();
let playit = new PlayIt();

(async () => {
  program
    .version(playit.version)
    .name('PlayIt')
    .usage('--tunnels <Port:Proto...>')
    .option(
      '-t, --tunnels <Port:Proto...>',
      'tunnels to create with the specified port and prototype'
    )
    .option('-e, --envs <Name:Value...>', 'environment options for playit')
    .parse();

  const opts = program.opts();

  if (opts.tunnels !== undefined)
    opts.tunnels = opts.tunnels.map((tunnel) => ({
      port: Number(tunnel.split(':')[0]),
      proto: tunnel.split(':')[1]
    }));
  else {
    // TODO: Optimize this area
    let tunnels = [],
      tunnel;
    const promptForTunnel = async () => {
      tunnel = await prompt(
        [
          {
            type: 'number',
            name: 'port',
            message: 'What Port Do You Want To Use?',
            validate: (port) =>
              !isNaN(Number(port)) && Number(port) <= 65353 && Number(port) > 0
                ? true
                : 'The Port Must Be A Number And Between 1 And 65535'
          },
          {
            type: 'select',
            name: 'proto',
            message: 'What Network Prototype Do You Want To Use?',
            choices: [
              { title: 'TCP', value: 'tcp' },
              { title: 'UDP', value: 'udp' }
            ]
          },
          {
            type: 'confirm',
            name: 'another',
            message: 'Would You Like To Create Another Tunnel?'
          }
        ],
        { onCancel: () => true }
      );

      tunnels.push(tunnel);

      if (tunnel.another) await promptForTunnel();

      return tunnels;
    };

    opts.tunnels = await promptForTunnel();
  }

  opts.env = opts.envs
    ? opts.envs.map((env) => ({
        name: env.split(':')[0],
        value: env.split(':')[1]
      }))
    : [];

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
  }

  playit = await playit.create();
  playit.onError(console.error);
  playit.onWarning(console.warn);

  for (const tunnel of opts.tunnels)
    (async () =>
      console.log(
        `http://${(await playit.createTunnel(tunnel)).url} : ${
          tunnel.port
        }:${tunnel.proto.toUpperCase()}`
      ))();
})();
