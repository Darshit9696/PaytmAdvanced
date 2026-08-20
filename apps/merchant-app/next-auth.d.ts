import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      merchantId: string;
      email: string;
      name: string;
      businessName?: string;
      ownerName?: string;
      phone?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    merchantId?: string;
    email: string;
    name: string;
    businessName?: string;
    ownerName?: string;
    phone?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    merchantId?: string;
    email?: string;
    name?: string;
    businessName?: string;
    ownerName?: string;
    phone?: string;
    role?: string;
  }
}
