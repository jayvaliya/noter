import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST to toggle a bookmark (create if doesn't exist, delete if exists)
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

        let isBookmarked = false;

        if (existingBookmark) {
            // If bookmark exists, delete it
            await prisma.bookmark.delete({
                where: {
                    userId_noteId: {
                        userId,
                        noteId,
                    }
                }
            });
            isBookmarked = false;
        } else {
            // If bookmark doesn't exist, create it
            await prisma.bookmark.create({
                data: {
                    userId,
                    noteId,
                }
            });
            isBookmarked = true;
        }

        // Return the current bookmark state
        return NextResponse.json({ isBookmarked });
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return NextResponse.json(
            { message: 'An error occurred while toggling the bookmark' },
            { status: 500 }
        );
    }
}