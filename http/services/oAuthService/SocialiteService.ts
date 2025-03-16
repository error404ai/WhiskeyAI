// Abstract OAuthProvider
import { OAuthProvider } from "./OAuthProvider";
import { TwitterProvider } from "./providers/TwitterProvider";

interface TwitterCredentials {
  clientId: string;
  clientSecret: string;
}

export class SocialiteService {
  private providers: Map<string, OAuthProvider>;
  private twitterCredentials?: TwitterCredentials;

  constructor(twitterCredentials?: TwitterCredentials) {
    this.twitterCredentials = twitterCredentials;
    this.providers = new Map();
    this.providers.set("twitter", new TwitterProvider(twitterCredentials));
  }

  /**
   * Get the OAuth provider instance based on the driver name.
   */
  driver(name: string): OAuthProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`OAuth provider [${name}] is not supported.`);
    }
    return provider;
  }
}

export const Socialite = new SocialiteService();
