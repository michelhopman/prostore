import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      role: string;
    };
  }
  interface JWT {
    role: string;
    name: string;
  }
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string;
  }
}

export const config: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add your providers here
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        //Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        //check if user exists and password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          //If password is correct, return the user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      //set user id from token
      session.user.id = token.sub as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;

      //if there is an updated user, set the user name
      if (trigger === "update") {
        session.user.name = user.name as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;
        // If user has no name then use the email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          // Update database to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
