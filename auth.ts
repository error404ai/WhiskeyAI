import { Jwt } from "jsonwebtoken";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UserResourceType } from "./http/resource/userResource";
import AuthService from "./http/services/authService";

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
    async jwt({ token, user, session }) {
      if (user) {
        token.user = user;
      }
      if (session?.user) {
        token.user = session.user;
      }
      return token;
    },
    async session({ session, token, user }) {
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
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await AuthService.verifyUserPasswordHash(credentials?.email as string, credentials?.password as string);

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
});
