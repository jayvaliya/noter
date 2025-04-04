import { DefaultSession, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

// Export the auth options type
export type AuthOptions = NextAuthOptions;

// JWT with our custom properties
export interface ExtendedJWT extends JWT {
    id?: string;
    accessToken?: string;
}