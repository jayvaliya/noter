import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create handler and export it properly
const handler = NextAuth(authOptions);

// This is the correct way to export the handler for App Router
export { handler as GET, handler as POST };