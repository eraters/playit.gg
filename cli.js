#!/usr/bin/env node

import { PlayIt } from 'playit.gg';
import { Command, Option } from 'commander';
import blessed from 'blessed';
import contrib from 'blessed-contrib';

const program = new Command();

(async () => {
  let playit = new PlayIt();

  program
    .version(playit.version)
    .name('PlayIt')
    .usage('--proto [Network Protocol] --port [Port]')
    .addOption(
      new Option(
        '-p, --port',
        'port to expose. must be between 0 and 65535'
      ).default(80)
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

  if (opts.proto === undefined) opts.proto = 'tcp';
  if (opts.port === undefined) opts.port = 80;

  if (!['udp', 'tcp'].includes(opts.proto?.toLowerCase()))
    throw new Error('the prototype must be either UDP, or TCP');

  if (
    !(
      !isNaN(Number(opts.port)) &&
      Number(opts.port) <= 65353 &&
      Number(opts.port) > 0
    )
  )
    throw new Error(
      'the port must be a valid integer, and between 0 and 65353'
    );
  playit = await playit.create();
  const tunnel = await playit.createTunnel({
    proto: opts.proto,
    port: Number(opts.port)
  });

  if (!opts.gui) {
    console.log(`http://${tunnel.url}`);
    return;
  }

  // Setup the TUI
  const screen = blessed.screen({ title: 'PlayIt.GG', smartCSR: true });
  const grid = new contrib.grid({ rows: 20, cols: 20, screen: screen });
  grid.set(0, 8, 5, 5, blessed.text, {
    label: 'Tunnel URL',
    content: `http://${tunnel.url}`,
    align: 'center'
  });
  const log = grid.set(0, 0, 20, 8, contrib.log, {
    fg: 'green',
    selectedFg: 'green',
    label: 'PlayIt Logs'
  });

  playit.onOutput((output) => output.split('\n').map((line) => log.log(line)));
  screen.render();
})();
