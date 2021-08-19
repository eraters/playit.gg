export default class playit {
    destroyed: Boolean;
    arch: String;
    tunnels: tunnel[];
    agent: agent | undefined;
    started: Boolean;
    playit: any;
    os: os;
    version: string;
    configFile: string;
    downloadUrls: binaries;
    binary: string | undefined;
    constructor();
    disableTunnel(id: number): Promise<void>;
    enableTunnel(id: number): Promise<void>;
    createTunnel(tunnelOpts?: tunnelOpts): Promise<tunnel>;
    private claimUrl;
    create(startOpts?: startOpts): Promise<playit>;
    stop(): void;
    download(os?: os): Promise<string>;
    private fetch;
}
export declare function init(opts?: initOpts): Promise<playit>;
interface startOpts {
    playitOpts?: any;
}
interface tunnelOpts {
    proto?: string;
    port?: number;
}
interface agent {
    agent_key: string;
    preferred_tunnel: string;
}
interface initOpts extends startOpts {
    justConstructor?: Boolean;
}
interface tunnel {
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
interface binaries {
    win?: string;
    lin?: string;
    mac?: string;
    arm?: string;
    aarch?: string;
}
declare type os = 'win' | 'mac' | 'lin';
export {};
