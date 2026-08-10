import { prisma } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { type AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Merchant Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "merchant@business.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailClean = credentials.email.trim().toLowerCase();

        // 1. Find merchant by email
        const existingMerchant = await prisma.merchant.findUnique({
          where: {
            email: emailClean,
          },
        });

        if (!existingMerchant) {
          return null;
        }

        // 2. Compare hashed password
        const passwordMatched = await bcrypt.compare(
          credentials.password,
          existingMerchant.password
        );

        if (!passwordMatched) {
          return null;
        }

        // 3. Return authenticated merchant object
        return {
          id: existingMerchant.id.toString(),
          email: existingMerchant.email,
          name: existingMerchant.ownerName,
          businessName: existingMerchant.businessName,
          ownerName: existingMerchant.ownerName,
          role: "merchant",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || "merchant-secret-key-12345",

  pages: {
    signIn: "/merchant/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.businessName = user.businessName;
        token.ownerName = user.ownerName;
        token.role = "merchant";
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || "";
        session.user.name = (token.ownerName as string) || (token.name as string) || "";
        session.user.businessName = token.businessName as string;
        session.user.ownerName = token.ownerName as string;
        session.user.role = (token.role as string) || "merchant";
      }
      return session;
    },
  },
};
