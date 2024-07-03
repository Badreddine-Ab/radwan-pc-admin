import NextAuth from "next-auth";

import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";
import prisma from "./prisma";

export const config = {
  providers: [
    Google({
      profile(profile) {
        return {
          role: profile.role ?? "REGULAR",
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    Facebook({
      profile(profile) {
        return {
          role: profile.role ?? "REGULAR",
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example" || pathname.startsWith("/admin"))
        return !!auth;
      return true;
    },
    jwt({ token, trigger, session, user }) {
      if (trigger === "update") {
        token.role = user.role;
        token.name = session.user.name;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email ?? "" },
      });
      if (!existingUser || existingUser.role !== "ADMIN") {
        // Prevent sign-in if user does not exist or is not an admin
        return false;
      }
      existingUser = await prisma.user.update({
        where: { email: user.email ?? "" },
        data: {
          name: user.name ?? "",
          image: user.image ?? "",
        },
      });
      return true;
    },
    /*  async session({ session, user}) {
       const dbUser = await prisma.user.findUnique({
         where: { email: user.email },
       });
 
       if (dbUser) {
         session.user.role = dbUser.role;
       }
 
       return session;
     } */
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
