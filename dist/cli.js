#!/usr/bin/env node
import { PlayIt } from 'playit.gg';
import { Command, Option } from 'commander';
const program = new Command();
(async () => {
    let playit = new PlayIt();
    program
        .version(playit.version)
        .name('PlayIt')
        .usage('--proto [Network Protocol] --port [Port]')
        .addOption(new Option('-p, --port', 'port to expose. must be between 0 and 65535').default(80))
        .addOption(new Option('--proto', 'network protocol to expose. can either be TCP or UDP').default('TCP'))
        .parse();
    const opts = program.opts();
    if (opts.proto === undefined)
        opts.proto = 'tcp';
    if (opts.port === undefined)
        opts.port = 80;
    if (!['udp', 'tcp'].includes(opts.proto?.toLowerCase()))
        throw new Error('the prototype must be either UDP, or TCP');
    if (!(!isNaN(Number(opts.port)) &&
        Number(opts.port) <= 65353 &&
        Number(opts.port) > 0))
        throw new Error('the port must be a valid integer, and between 0 and 65353');
    playit = await playit.create();
    const tunnel = await playit.createTunnel({
        proto: opts.proto,
        port: Number(opts.port)
    });
    console.log(`http://${tunnel.url}`);
})();
