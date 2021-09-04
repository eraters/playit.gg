export declare class PlayIt {
    destroyed: Boolean;
    arch: String;
    dir: string;
    tunnels: tunnel[];
    agent: agent | undefined;
    started: Boolean;
    playit: any;
    servers: any[] | undefined;
    os: os;
    version: string;
    configFile: string;
    downloadUrls: binaries;
    binary: string | undefined;
    output: string;
    stdout: string;
    stderr: string;
    onOutput: Function | undefined;
    constructor();
    disableTunnel(id: number): Promise<void>;
    enableTunnel(id: number): Promise<void>;
    createTunnel(tunnelOpts?: tunnelOpts): Promise<tunnel>;
    private claimUrl;
    create(playitOpts?: any): Promise<PlayIt>;
    stop(): void;
    download(os?: os): Promise<string>;
    private fetch;
}
export default function init(playitOpts?: any): Promise<PlayIt>;
export interface tunnelOpts {
    proto?: string;
    port?: number;
}
export interface agent {
    agent_key: string;
    preferred_tunnel: string;
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
    win?: string;
    lin?: string;
    mac?: string;
    arm?: string;
    aarch?: string;
}
export declare type os = 'win' | 'mac' | 'lin';
