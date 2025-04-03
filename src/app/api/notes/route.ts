import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { message: 'You must be logged in to create notes' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Parse request body
        const { title, content } = await req.json();

        // Validate inputs
        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Create the note in the database
        const note = await prisma.note.create({
            data: {
                title,
                content,
                authorId: userId,
            },
        });

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { message: 'An error occurred while creating the note' },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'You must be logged in to view notes' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Get all notes for the user
        const notes = await prisma.note.findMany({
            where: {
                authorId: userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching notes' },
            { status: 500 }
        );
    }
}
