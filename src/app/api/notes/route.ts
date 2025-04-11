import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Create new note.
export async function POST(req: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to create notes' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Parse request body
        const { title, content, isPublic = true, folderId = null } = await req.json();

        // Validate inputs
        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

        // If folderId is provided, verify it's valid and user has access
        if (folderId) {
            const folder = await prisma.folder.findUnique({
                where: {
                    id: folderId,
                    authorId: userId
                }
            });

            if (!folder) {
                return NextResponse.json(
                    { message: 'Folder not found or you do not have permission' },
                    { status: 404 }
                );
            }
        }

        // Create the note in the database
        const note = await prisma.note.create({
            data: {
                title,
                content,
                isPublic,
                authorId: userId,
                folderId: folderId || null
            },
            // Only select fields we need to return
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                isPublic: true,
                authorId: true
            }
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

// Fetch all notes for the authenticated user.
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Get the user ID if authenticated
        const userId = session?.user?.id;

        // Add this parameter to filter by folder
        const folderId = req.nextUrl.searchParams.get('folderId') || null;

        // If user is authenticated, return their notes
        if (userId) {
            // Directly select only the fields we need
            const notes = await prisma.note.findMany({
                where: {
                    authorId: userId,
                    // Add this condition to filter by folder
                    folderId: folderId || null
                },
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                    createdAt: true,
                    isPublic: true,
                    authorId: true,
                    folderId: true, // Add this to include folder ID
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
                    title: 'asc',
                },
            });

            // We still need minimal transformation for computed fields
            const notesWithBookmarkStatus = notes.map(note => ({
                id: note.id,
                title: note.title,
                updatedAt: note.updatedAt,
                createdAt: note.createdAt,
                isPublic: note.isPublic,
                authorId: note.authorId,
                isBookmarked: note.bookmarks.length > 0
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
