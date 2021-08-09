declare module 'playit.gg';

declare class playit {
  constructor(opts: Object): Promise<playit>;

  private async start(opts: Object): Promise<String>;

  async stop(): Promise<void>;

  async claimUrl(url: String): Promise<String>;

  async createTunnel(opts: Object): Promise<Object>;

  async login(email: String, password: String): Promise<void>;

  async loginWithToken(token: String): Promise<void>;
}
