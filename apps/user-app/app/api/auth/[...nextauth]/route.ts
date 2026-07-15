import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create an authentication handler using these options.
const handler = NextAuth(authOptions);

// "Whenever a GET or POST request comes to this route, call the handler."
export { handler as GET, handler as POST };