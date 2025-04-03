import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with better error handling
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            // Return the user without password
            return NextResponse.json(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                { status: 201 }
            );
        } catch (createError) {
            console.error("User creation error:", createError);
            return NextResponse.json(
                { error: "Failed to create user", details: (createError as Error).message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration", details: (error as Error).message },
            { status: 500 }
        );
    }
}