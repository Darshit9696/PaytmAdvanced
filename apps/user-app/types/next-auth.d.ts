import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId?: string;
      email?: string | null;
      name?: string | null;
      number?: string | null;
      businessName?: string;
      ownerName?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    userId?: string;
    email?: string | null;
    name?: string | null;
    number?: string | null;
    businessName?: string;
    ownerName?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    id?: string;
    userId?: string;
    email?: string;
    name?: string;
    number?: string;
    businessName?: string;
    ownerName?: string;
    role?: string;
  }
}