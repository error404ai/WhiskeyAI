// Abstract OAuthProvider
import { OAuthProvider } from "./OAuthProvider";
import { TwitterProvider } from "./providers/TwitterProvider";

export class SocialiteService {
  private providers: Map<string, OAuthProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set("twitter", new TwitterProvider());
  }

  /**
   * Get the OAuth provider instance based on the driver name.
   */
  driver(driverName: string): OAuthProvider {
    if (!this.providers.has(driverName)) {
      throw new Error(`Provider ${driverName} not supported.`);
    }
    return this.providers.get(driverName)!;
  }
}

export const Socialite = new SocialiteService();
