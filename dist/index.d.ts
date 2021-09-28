/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from 'child_process';
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
    type: 'arm' | 'mac' | 'win' | 'lin' | 'aarch';
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
    disableTunnel(id: number): Promise<void>;
    enableTunnel(id: number): Promise<void>;
    createTunnel(tunnelOpts: tunnelOpts): Promise<tunnel>;
    private claimUrl;
    create(playitOpts?: any): Promise<PlayIt>;
    stop(): void;
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
