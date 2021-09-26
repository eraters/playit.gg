/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
/**  @class */
export declare class PlayIt {
    destroyed: Boolean;
    arch: 'x64' | 'arm' | 'arm64';
    dir: string;
    tunnels: tunnel[];
    agent_key: string;
    started: Boolean;
    playit: ChildProcessWithoutNullStreams | undefined;
    preferred_tunnel: string;
    used_packets: number;
    free_packets: number;
    connections: connection[];
    os: os;
    version: string;
    configFile: string;
    downloadUrls: binaries;
    type: 'armv7' | 'darwin' | 'win' | 'linux' | 'aarch64';
    binary: string | undefined;
    output: string;
    stdout: string;
    stderr: string;
    errors: string;
    warnings: string;
    onOutput: Function | undefined;
    onStdout: Function | undefined;
    onStderr: Function | undefined;
    onError: Function | undefined;
    onWarning: Function | undefined;
    constructor();
    /**
     * @param {number} id - The Tunnel ID
     * @description Disables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>);
     */
    disableTunnel(id?: number): Promise<void>;
    /**
     * @param {number} id - The Tunnel ID
     * @description Enables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
     * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
     */
    enableTunnel(id?: number): Promise<void>;
    /**
     * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
     * @description Creates A Tunnel With The Specified Port And Protocall
     * @example
     * const tunnel = await playit.createTunnel({ port: <Port>, proto: <Network Protocall> });
     * console.log(tunnel.url);
     */
    createTunnel(tunnelOpts?: tunnelOpts): Promise<tunnel>;
    private claimUrl;
    /**
     * @param {any} playitOpts - Options To Put Into The `.env` File
     * @description Starts PlayIt
     * @example
     * import { PlayIt } from 'playit.gg';
     * const playit = await new PlayIt.create(<Options For Playit>);
     */
    create(playitOpts?: any): Promise<PlayIt>;
    /**
     * @description Stops PlayIt
     * @example
     * playit.stop(); // Stops PlayIt, Class Cannot Be Used After Run
     */
    stop(): void;
    /**
     * @description Downloads PlayIt To A Temp Folder
     * @example
     * const playitBinary = await playit.download(); // Downloads PlayIt, And Returns The File Path
     */
    download(): Promise<string>;
    private parseOutput;
    private fetch;
}
export default function init(playitOpts?: any): Promise<PlayIt>;
export interface tunnelOpts {
    proto?: string;
    port: number;
}
export interface tunnel {
    id: number;
    agent_id: number;
    game: string;
    local_ip: '127.0.0.1';
    local_port: number;
    domain_id: number;
    status: 'Active';
    connect_address: string;
    is_custom_domain: false;
    tunnel_version: number;
    url: string;
}
export interface binaries {
    win: string;
    lin: string;
    mac: string;
    arm: string;
    aarch: string;
}
export interface connection {
    ip: string;
    tunnel: tunnel;
    type: 'tcp' | 'udp';
}
export declare type os = 'win' | 'mac' | 'lin';
