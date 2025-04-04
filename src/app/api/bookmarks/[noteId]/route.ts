import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST to create a bookmark
export async function POST(
    request: NextRequest,
    context: { params: { noteId: string } }
) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        const noteId = context.params.noteId;

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to bookmark notes' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Check if the note exists
        const note = await prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note) {
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        // Check if bookmark already exists
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_noteId: {
                    userId,
                    noteId,
                }
            }
        });

        if (existingBookmark) {
            return NextResponse.json(
                { message: 'Note is already bookmarked' },
                { status: 400 }
            );
        }

        // Create bookmark
        const bookmark = await prisma.bookmark.create({
            data: {
                userId,
                noteId,
            }
        });

        return NextResponse.json(bookmark);
    } catch (error) {
        console.error('Error creating bookmark:', error);
        return NextResponse.json(
            { message: 'An error occurred while bookmarking the note' },
            { status: 500 }
        );
    }
}

// DELETE to remove a bookmark
export async function DELETE(
    request: NextRequest,
    context: { params: { noteId: string } }
) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        const noteId = context.params.noteId;

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to remove bookmarks' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        try {
            // Delete the bookmark
            await prisma.bookmark.delete({
                where: {
                    userId_noteId: {
                        userId,
                        noteId,
                    }
                }
            });

            return NextResponse.json({ message: 'Bookmark removed successfully' });
        } catch {
            // If the bookmark doesn't exist, return a 404
            return NextResponse.json(
                { message: 'Bookmark not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return NextResponse.json(
            { message: 'An error occurred while removing the bookmark' },
            { status: 500 }
        );
    }
}