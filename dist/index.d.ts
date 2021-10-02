/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
/**  @class */
export declare class PlayIt {
    /**
     * @description Whether PlayIt Has Been Stopped
     */
    destroyed: Boolean;
    /**
     * @description The Architexture Of The Current System
     */
    arch: 'x64' | 'arm' | 'arm64';
    /**
     * @description The Directory That PlayIt Is Running In
     */
    dir: string;
    /**
     * @description Tunnels Created
     */
    tunnels: tunnel[];
    /**
     * @description The Key Of The Agent
     */
    agent_key: string;
    /**
     * @description Whether PlayIt Has Been Started
     */
    started: Boolean;
    /**
     * @description The PlayIt Child Process
     */
    playit: ChildProcessWithoutNullStreams | undefined;
    /**
     * @description The Tunnel PlayIt Is Using
     */
    tunnel: string;
    /**
     * @description The Packets PlayIt Has Used
     */
    used_packets: number;
    /**
     * @description The Packets PlayIt Has Not Used
     */
    free_packets: number;
    /**
     * @description The Connections, **THIS IS A WIP**
     */
    connections: connection[];
    /**
     * @description The Operating System Of The Current System
     */
    os: os;
    /**
     * @description The Version Of PlayIt Being Used
     */
    version: string;
    /**
     * @description The Configuration File Of PlayIt
     */
    configFile: string;
    /**
     * @description The Download URLs For PlayIt
     */
    downloadUrls: binaries;
    /**
     * @description The Downloaded Type Of PlayIt
     */
    type: 'arm' | 'mac' | 'win' | 'lin' | 'arm64';
    /**
     * @description The Path To The Downloaded Binary
     */
    binary: string | undefined;
    /**
     * @description The Output Of PlayIt
     */
    output: string[];
    /**
     * @description The Stdout Ouput Of PlayIt
     */
    stdout: string[];
    /**
     * @description The Stderr Ouput Of PlayIt
     */
    stderr: string[];
    /**
     * @description The Errors Of PlayIt
     */
    errors: string[];
    /**
     * @description The Warnings Of PlayIt
     */
    warnings: string[];
    /**
     * @description An Output Callback For PlayIt
     * @param
     */
    onOutput: Function | undefined;
    /**
     * @param {Function} callback - The Callback To Call When PlayIt Outputs Something In Stdout
     * @description The Stderr Callback For PlayIt
     * @returns {void}
     */
    onStdout: (callback: Function) => void | undefined;
    /**
     * @param {Function} callback - The Callback To Call When PlayIt Outputs Something In Stderr
     * @description The Stderr Callback For PlayIt
     * @returns {void}
     */
    onStderr: (callback: Function) => void | undefined;
    /**
     * @param {Function} callback - The Callback To Call When PlayIt Outputs An Error
     * @description The Stderr Callback For PlayIt
     * @returns {void}
     */
    onError: (callback: Function) => void | undefined;
    /**
     * @param {Function} callback - The Callback To Call When PlayIt Outputs A Warning
     * @description The Stderr Callback For PlayIt
     * @returns {void}
     */
    onWarning: (callback: Function) => void | undefined;
    constructor();
    /**
     * @param {number} id - The Tunnel ID
     * @description Disables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>);
     */
    disableTunnel(id: number): Promise<void>;
    /**
     * @param {number} id - The Tunnel ID
     * @description Enables The Specified Tunnel
     * @example
     * await playit.disableTunnel(<Tunnel ID>); // Disables The Tunnel
     * await playit.enableTunnel(<Same Tunnel ID>); // Enables The Tunnel Again
     */
    enableTunnel(id: number): Promise<void>;
    /**
     * @param {tunnelOpts} tunnelOpts - Options For The Tunnel
     * @description Creates A Tunnel With The Specified Port And Protocall
     * @example
     * const tunnel = await playit.createTunnel({ port: <Port>, proto: <Network Protocall> });
     * console.log(tunnel.url);
     */
    createTunnel(tunnelOpts: tunnelOpts): Promise<tunnel>;
    private claimUrl;
    /**
     * @param {any} playitOpts - Options To Put Into The `.env` File
     * @description Starts PlayIt
     * @example
     * import { PlayIt } from 'playit.gg';
     * const playit = await new PlayIt.create(<Options For Playit>);
     */
    start(playitOpts?: any): Promise<PlayIt>;
    /**
     * @description Stops PlayIt
     * @example
     * playit.stop(); // Stops PlayIt, Class Cannot Be Used After Run
     */
    stop(): void;
    private download;
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
    arm64: string;
}
export interface connection {
    ip: string;
    tunnel: tunnel;
    type: 'tcp' | 'udp';
}
export interface playitEnv {
    PREFERRED_TUNNEL?: 'dal4' | 'sol4' | 'syd4' | 'mum4' | 'sf4' | 'fnk4' | 'bng4' | 'sng4' | 'tor4' | 'ny4' | 'uk4' | 'saw4' | 'turk4' | 'san4' | 'pet4' | 'bur4' | 'new4' | 'isr4' | 'tko4' | 'syd5' | 'sng5' | 'hel4' | 'fal4';
    PREFERRED_THRESHOLD?: number;
    NO_BROWSER?: true;
    NO_SPECIAL_LAN?: boolean;
}
export declare type os = 'win' | 'mac' | 'lin';
