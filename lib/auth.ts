import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { getAuthSecret, getGoogleOAuthConfig } from "@/lib/auth-env";
import { findOrCreateOAuthUser, getUserByEmail } from "@/lib/auth-store";
import { verifyPassword } from "@/lib/auth-crypto";

const googleOAuthConfig = getGoogleOAuthConfig();

const providers: NextAuthOptions["providers"] = [];

if (googleOAuthConfig.clientId && googleOAuthConfig.clientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleOAuthConfig.clientId,
      clientSecret: googleOAuthConfig.clientSecret,
    }),
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password ?? "";

      if (!email || !password) {
        return null;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
      };
    },
  }),
);

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret() || undefined,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      const appUser = await findOrCreateOAuthUser({
        email,
        name: user.name,
      });

      user.id = appUser.id;
      user.email = appUser.email;
      user.name = appUser.name ?? appUser.email;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }

      return session;
    },
  },
};

export const nextAuthHandler = NextAuth(authOptions);

export function auth() {
  return getServerSession(authOptions);
}

export async function requireUser(redirectTo = "/saved-products") {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  return {
    userId,
    session,
  };
}
