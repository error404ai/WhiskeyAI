import bs58 from "bs58";
import { Jwt } from "jsonwebtoken";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as nacl from "tweetnacl";
import { UserResourceType } from "./server/resource/userResource";
import AdminService from "./server/services/admin/adminService";
import UserService from "./server/services/userService";

declare module "next-auth" {
  interface Session {
    user: UserResourceType & DefaultSession["user"];
    token: Jwt;
    twitterAgentId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, session }) {
      if (user) {
        token.user = user;
      }
      if (session?.user) {
        token.user = session.user;
      }

      if (session?.twitterAgentId) {
        token.twitterAgentId = session?.twitterAgentId;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (user) {
        session.user = user as UserResourceType;
      } else {
        session.user = token.user as UserResourceType;
      }

      if (token.twitterAgentId) {
        session.twitterAgentId = token.twitterAgentId as string;
      }
      return session;
    },

    async redirect({ url }) {
      const urlParams = new URLSearchParams(new URL(url).search);
      const redirectUrl = urlParams.get("intended");
      if (redirectUrl) {
        return redirectUrl;
      }
      return url;
    },
  },

  secret: process.env.AUTH_SECRET,
  providers: [
    // Admin credentials provider for username/password login
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password } = credentials as { username: string; password: string };

        if (!username || !password) {
          throw new Error("Missing credentials");
        }

        // Verify admin credentials
        const user = await AdminService.validateAdminCredentials(username, password);

        if (!user) {
          throw new Error("Invalid username or password");
        }

        return user;
      },
    }),
    // Wallet credentials provider for regular users
    Credentials({
      id: "wallet-login",
      name: "Wallet Login",
      credentials: {
        publicKey: { label: "Public Key", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      authorize: async (credentials) => {
        // Cast the credentials to the correct type
        const { publicKey, signature, message } = credentials as { publicKey: string; signature: string; message: string };

        if (!publicKey || !signature || !message) {
          throw new Error("Missing credentials");
        }

        // Decode signature
        const decodedSignature = bs58.decode(signature);

        // Verify signature using Solana's nacl library
        const isValid = nacl.sign.detached.verify(new TextEncoder().encode(message), decodedSignature, bs58.decode(publicKey));

        if (!isValid) {
          throw new Error("Invalid Signature");
        }

        let user = await UserService.findUserByPublicKey(publicKey);
        if (!user) {
          user = await UserService.createUserByPublicKey(publicKey);
        }

        if (!user) {
          throw new Error("Failed to login");
        }

        // Check if the user is blocked
        if (user.is_active === false) {
          // Instead of throwing an error, return null with status code
          // This will be handled by NextAuth and our login controller
          return null;
        }

        return user;
      },
    }),
    // TwitterProvider({
    //   clientId: process.env.TWITTER_CLIENT_ID,
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET,
    //   authorization: {
    //     url: "https://twitter.com/i/oauth2/authorize",
    //     params: {
    //       scope: "users.read tweet.read tweet.write offline.access",
    //     },
    //   },

    //   account(account) {
    //     console.log("account from  provider is", account);
    //     return account;
    //   },

    //   profile(profile) {
    //     console.log("profile is", profile);
    //     return {
    //       id: profile.id as string,
    //       name: profile.name as string,
    //       email: profile.email as string,
    //       image: profile.image as string,
    //     };
    //   },
    // }),
  ],
});
