declare module "playit.gg";

declare class playit {
    constructor(opts: Object);

    private start(opts: Object): Promise<String>;

    stop(): Promise<void>;

    private claimUrl(url: String): Promise<String>;

    createTunnel(opts: Object): Promise<Object>;

    login(email: String, password: String): Promise<void>;

    loginWithToken(token: String): Promise<void>;
}