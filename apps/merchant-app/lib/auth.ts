import { prisma } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { type AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
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
          merchantId: existingMerchant.id.toString(),
          email: existingMerchant.email,
          name: existingMerchant.ownerName,
          businessName: existingMerchant.businessName,
          ownerName: existingMerchant.ownerName,
          phone: existingMerchant.phone,
          role: "MERCHANT",
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
      name: `next-auth.merchant-session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "merchant-secret-key-12345",

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // user  = the user returned by authorize()
    // copy their information into the JWT."
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.merchantId = (user as any).merchantId || user.id;
        token.email = user.email || "";
        token.name = (user as any).ownerName || user.name || "";
        token.businessName = (user as any).businessName || "";
        token.ownerName = (user as any).ownerName || "";
        token.phone = (user as any).phone || "";
        token.role = "MERCHANT";
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user && token) {
        session.user.id = (token.merchantId || token.id) as string;
        session.user.merchantId = (token.merchantId || token.id) as string;
        session.user.email = (token.email as string) || "";
        session.user.name = (token.ownerName as string) || (token.name as string) || "";
        session.user.businessName = (token.businessName as string) || "";
        session.user.ownerName = (token.ownerName as string) || "";
        session.user.phone = (token.phone as string) || "";
        session.user.role = "MERCHANT";
      }
      return session;
    },
  },
};
