export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  state?: string;
}

export interface OAuthUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface getRedirectUriParams {
  scopes: string[];
  state?: string;
}

export abstract class OAuthProvider {
  protected clientId!: string;
  protected clientSecret!: string;
  protected redirectUri!: string;
  protected authUrl!: string;
  protected tokenUrl!: string;
  protected userInfoUrl!: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  abstract redirect({ scopes, state }: getRedirectUriParams): Promise<never>;

  abstract exchangeCodeForToken(request: Request): Promise<OAuthTokens>;

  abstract getUserInfo(accessToken: string): Promise<OAuthUser>;
}
