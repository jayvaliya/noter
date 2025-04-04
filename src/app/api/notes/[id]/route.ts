import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Note } from '@/types';

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
): Promise<NextResponse<Note | { message: string }>> {
    try {
        const { id } = context.params;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const noteId = id;

        // Fetch the note with author information
        const note = await prisma.note.findUnique({
            where: {
                id: noteId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                // Include bookmarks if user is authenticated
                ...(userId
                    ? {
                        bookmarks: {
                            where: { userId },
                            select: { id: true },
                        },
                    }
                    : {}),
            },
        });

        if (!note) {
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        // If note is not public and user is not the owner, deny access
        if (!note.isPublic && (!userId || note.authorId !== userId)) {
            return NextResponse.json(
                { message: 'You do not have permission to view this note' },
                { status: 403 }
            );
        }

        // Transform for response
        const noteResponse = {
            ...note,
            isBookmarked: userId ? note.bookmarks?.length > 0 : false,
            bookmarks: undefined,
        };

        return NextResponse.json(noteResponse);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the note' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'You must be logged in to delete notes' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // In Next.js 14+, params might be a Promise that needs to be awaited
        const resolvedParams = await params;
        const noteId = resolvedParams.id;

        // Check if the note exists and belongs to the user
        const note = await prisma.note.findUnique({
            where: {
                id: noteId,
            },
        });

        if (!note) {
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        if (note.authorId !== userId) {
            return NextResponse.json(
                { message: 'You do not have permission to delete this note' },
                { status: 403 }
            );
        }

        // Delete the note
        await prisma.note.delete({
            where: {
                id: noteId,
            },
        });

        return NextResponse.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { message: 'An error occurred while deleting the note' },
            { status: 500 }
        );
    }
}

// Update to handle privacy setting changes
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'You must be logged in to update notes' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const noteId = params.id;
        const { title, content, isPublic } = await req.json();

        // Check if the note exists and belongs to the user
        const note = await prisma.note.findUnique({
            where: {
                id: noteId,
            },
        });

        if (!note) {
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        if (note.authorId !== userId) {
            return NextResponse.json(
                { message: 'You do not have permission to update this note' },
                { status: 403 }
            );
        }

        // Update the note
        const updatedNote = await prisma.note.update({
            where: {
                id: noteId,
            },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(isPublic !== undefined && { isPublic }),
            },
        });

        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { message: 'An error occurred while updating the note' },
            { status: 500 }
        );
    }
}