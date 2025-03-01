import bs58 from "bs58";
import { Jwt } from "jsonwebtoken";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import * as nacl from "tweetnacl";
import { UserResourceType } from "./http/resource/userResource";
import UserService from "./http/services/userService";

declare module "next-auth" {
  interface Session {
    user: UserResourceType & DefaultSession["user"];
    token: Jwt;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, session, account }) {
      console.log("account is", account);
      if (account?.provider === "twitter") return token;
      if (user) {
        token.user = user;
      }
      if (session?.user) {
        token.user = session.user;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("token is", token);
      if (user) {
        session.user = user as UserResourceType;
      } else {
        session.user = token.user as UserResourceType;
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
    Credentials({
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

        console.log("public key is", publicKey);

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

        return user;
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read tweet.write offline.access",
        },
      },
      account(account) {
        console.log("account is", account);
        return account;
      },

      profile(profile) {
        console.log("profile is", profile);
        return {
          id: profile.id as string,
          name: profile.name as string,
          email: profile.email as string,
          image: profile.image as string,
        };
      },
    }),
  ],
});
