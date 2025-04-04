import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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
        const { title, content, isPublic = true } = await req.json();

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
                isPublic,
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

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Get the user ID if authenticated
        const userId = session?.user?.id;

        // If user is authenticated, return their notes
        if (userId) {
            const notes = await prisma.note.findMany({
                where: {
                    authorId: userId,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    },
                    bookmarks: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });

            // Transform to include isBookmarked property
            const notesWithBookmarkStatus = notes.map(note => ({
                ...note,
                isBookmarked: note.bookmarks.length > 0,
                bookmarks: undefined,
            }));

            return NextResponse.json(notesWithBookmarkStatus);
        }

        // If not authenticated, return error
        return NextResponse.json(
            { message: 'Not authenticated' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching notes' },
            { status: 500 }
        );
    }
}
