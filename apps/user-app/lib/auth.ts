import { prisma } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { type AuthOptions } from "next-auth";

// Step 1: Validate credentials

// Step 2: Find user by phone number

// Step 3: Compare hashed password

// Step 4: Return user if authentication succeeds


export const authOptions : AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

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

        // 2. User doesn't exist
        if (!existingUser) {
          return null;
        }

        // 3. Compare passwords
        const passwordMatched = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );

        // 4. Wrong password
        if (!passwordMatched) {
          return null;
        }

        // 5. Login successful
        return {
          id: existingUser.id.toString(),
          name: existingUser.name,
          email: existingUser.email,
        };
      },
    }),
  ],

   session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ token, session }) {
      if(session.user && token.sub)
      {
          session.user.id = token.sub;
      }
      return session;
    },
  },
};