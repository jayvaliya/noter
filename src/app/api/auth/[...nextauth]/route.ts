import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Simplify the authorization configuration
            authorization: {
                params: {
                    prompt: "select_account"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    console.log("User search result:", !!user);

                    // If no user found
                    if (!user) {
                        console.log("No user found with this email");
                        return null;
                    }

                    // If no password (social login account)
                    if (!user.password) {
                        console.log("User has no password (likely a social login account)");
                        return null;
                    }

                    // Check if password matches
                    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                    console.log("Password match result:", passwordMatch);

                    if (!passwordMatch) {
                        console.log("Password does not match");
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            // Store the user id in the token right after sign-in
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async signIn({ user, account, profile }) {
            console.log("Sign in callback:", { user, account });
            return true;
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/signin",
    },
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };