import axios from "axios";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRedirectUriParams, OAuthProvider, OAuthTokens, OAuthUser } from "../OAuthProvider";

export class TwitterProvider extends OAuthProvider {
  constructor() {
    super(process.env.TWITTER_CLIENT_ID!, process.env.TWITTER_CLIENT_SECRET!, process.env.TWITTER_REDIRECT_URI!);
    this.authUrl = "https://x.com/i/oauth2/authorize";
    this.tokenUrl = "https://api.twitter.com/2/oauth2/token";
    this.userInfoUrl = "https://api.twitter.com/2/users/me";
  }

  generateCodeChallenge(codeVerifier: string): string {
    const hash = createHash("sha256").update(codeVerifier).digest();
    return Buffer.from(hash).toString("base64url");
  }

  async redirect({ scopes, state }: getRedirectUriParams): Promise<never> {
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    const cookieStore = await cookies();
    cookieStore.set("twitter_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(" "),
      state: state || "twitter",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const url = `${this.authUrl}?${params.toString()}`;
    return redirect(url);
  }

  async exchangeCodeForToken(request: Request): Promise<OAuthTokens> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") ?? "";

    if (!code) {
      throw new Error("Authorization code not provided");
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    cookieStore.delete("twitter_code_verifier");

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

      const params = new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      });

      const response = await axios.post(this.tokenUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
      });

      console.log("data is", response.data);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        state: state,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        console.error(`Token exchange failed (${statusCode}):`, errorData);
        throw new Error(`Token exchange failed: ${statusCode} - ${JSON.stringify(errorData)}`);
      } else {
        console.error("Token exchange network error:", error);
        throw new Error(`Token exchange network error: ${(error as Error).message}`);
      }
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    try {
      const response = await axios.get(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          "user.fields": "id,name,username,profile_image_url",
        },
      });

      const userData = response.data.data;

      console.log("user data is", userData);

      return {
        id: userData.id,
        username: userData.username,
        name: userData.name || userData.username,
        email: userData.email || null,
        avatar: userData.profile_image_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        console.error(`User info request failed (${statusCode}):`, errorData);
        throw new Error(`Failed to fetch user info: ${statusCode} - ${JSON.stringify(errorData)}`);
      } else {
        console.error("User info network error:", error);
        throw new Error(`User info network error: ${(error as Error).message}`);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      const response = await axios.post(this.tokenUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        console.error(`Token refresh failed (${statusCode}):`, errorData);
        throw new Error(`Token refresh failed: ${statusCode} - ${JSON.stringify(errorData)}`);
      } else {
        console.error("Token refresh network error:", error);
        throw new Error(`Token refresh network error: ${(error as Error).message}`);
      }
    }
  }
}
