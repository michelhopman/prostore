import NextAuth, { Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { NextAuthConfig } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
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
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });
            if (sessionCart) {
              //delete current user cart
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                },
              });
              //assign new cart
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: { userId: user.id },
              });
            }
          }
        }
      }
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }
      return token;
    },
    authorized({
      request,
      auth,
    }: {
      request: NextRequest;
      auth: Session | null;
    }): Response | boolean {
      //Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/admin/,
      ];

      //Get pathname from request object
      const { pathname } = request.nextUrl;

      //Check if user is authenticated and if the path is protected
      if (!auth && protectedPaths.some((path) => path.test(pathname)))
        return false;

      //Check for Cart session cookie
      if (!request.cookies.get("sessionCartId")) {
        //Create a new sessionCartId
        const sessionCartId = crypto.randomUUID();

        //Clone the request headers
        const newHeaders = new Headers(request.headers);

        //Create an response and add the new headers
        const response = NextResponse.next({
          headers: newHeaders,
        });

        //set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
