import { prisma } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { type AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "User Credentials",

      credentials: {
        phone: {
          label: "Phone Number",
          type: "text",
          placeholder: "9876543210",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials: any) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        // 1. Find the user
        const existingUser = await prisma.user.findUnique({
          where: {
            number: credentials.phone,
          },
        });

        if (!existingUser) {
          return null;
        }

        // 2. Compare passwords
        const passwordMatched = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatched) {
          return null;
        }

        // 3. Login successful
        return {
          id: existingUser.id.toString(),
          userId: existingUser.id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          number: existingUser.number,
          role: "USER",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  cookies: {
    sessionToken: {
      name: `next-auth.user-session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.userId = user.id;
        token.name = user.name || "";
        token.email = user.email || "";
        token.number = (user as any).number || "";
        token.role = "USER";
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user && (token.sub || token.id)) {
        session.user.id = (token.sub || token.id) as string;
        session.user.userId = (token.userId || token.sub || token.id) as string;
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.number = (token.number as string) || "";
        session.user.role = "USER";
      }
      return session;
    },
  },
};