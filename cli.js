#!/usr/bin/env node

const prompt = require('prompts');
const { PlayIt } = require('.');
const { Command, Option } = require('commander');

const program = new Command();
const playit = new PlayIt();

(async () => {
  program
    .version(playit.version)
    .name('PlayIt')
    .usage('--proto [Network Protocol] --port [Port]')
    .addOption(
      new Option('-p, --port', 'port to expose. must be between 0 and 65535')
    )
    .addOption(
      new Option(
        '--proto',
        'network protocol to expose. can either be TCP or UDP'
      ).default('TCP')
    )
    .addOption(new Option('-n, --no-gui', 'disables the tui interface'))
    .parse();

  const opts = program.opts();

  if (opts.proto === undefined && opts.port === undefined)
    Object.assign(
      opts,
      await prompt([
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
        }
      ])
    );
  else if (opts.port === undefined)
    opts.port = Number(
      (
        await prompt({
          type: 'number',
          name: 'port',
          message: 'What Port Do You Want To Use?',
          validate: (port) =>
            !isNaN(Number(port)) && Number(port) <= 65353 && Number(port) > 0
              ? true
              : 'The Port Must Be A Number And Between 1 And 65535'
        })
      ).port
    );
  else if (opts.proto === undefined) opts.proto = 'tcp';

  if (!['udp', 'tcp'].includes(opts.proto.toLowerCase()))
    throw new Error('the prototype must be either UDP, or TCP');

  if (
    !(
      !isNaN(Number(opts.port)) &&
      Number(opts.port) <= 65353 &&
      Number(opts.port) > 0
    )
  )
    throw new Error(
      'the port must be a valid integer, and between 1 and 65353'
    );
  playit = await playit.create();
  const tunnel = await playit.createTunnel({
    proto: opts.proto,
    port: Number(opts.port)
  });

  playit.onError(console.error);
  playit.onWarning(console.warn);

  console.log(`http://${tunnel.url}`);
})();
