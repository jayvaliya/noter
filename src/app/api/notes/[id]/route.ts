import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth';
import { Note } from '@/types';

// Fetch a single note by ID
// This API route fetches a note by its ID and checks if the user has permission to view it
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
): Promise<NextResponse<Note | { message: string }>> {
    try {
        const resolvedParams = await context.params;
        const noteId = resolvedParams.id;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Create cache key based on note ID and user authentication status
        const cacheKey = `note:${noteId}:${userId || 'anonymous'}`;

        try {
            // Try to get from cache first
            const cachedNote = await redis.get<Note>(cacheKey);
            if (cachedNote) {
                return NextResponse.json(cachedNote);
            }
        } catch (cacheError) {
            console.error('Redis cache read error:', cacheError);
            // Continue with database query if cache fails
        }

        // Fetch the note with minimum required fields
        const note = await prisma.note.findUnique({
            where: {
                id: noteId,
            },
            select: {
                id: true,
                title: true,
                content: true,  // Content needed for viewing the note
                createdAt: true,
                updatedAt: true,
                isPublic: true,
                authorId: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                // Only include bookmark data if user is authenticated
                ...(userId ? {
                    bookmarks: {
                        where: { userId },
                        select: { id: true },
                    },
                } : {}),
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

        // Add isBookmarked flag and remove the bookmarks array
        const noteResponse = {
            ...note,
            isBookmarked: userId && 'bookmarks' in note ? note.bookmarks.length > 0 : false,
            bookmarks: undefined,
        };

        // Cache the response for 5 minutes (300 seconds)
        try {
            await redis.setex(cacheKey, 300, noteResponse);
        } catch (cacheError) {
            console.error('Redis cache write error:', cacheError);
            // Continue even if caching fails
        }

        return NextResponse.json(noteResponse);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the note' },
            { status: 500 }
        );
    }
}

// Delete note
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

        // Invalidate cache for this note (all users)
        try {
            await redis.del(`note:${noteId}:${userId}`);
            await redis.del(`note:${noteId}:anonymous`);
        } catch (cacheError) {
            console.error('Redis cache invalidation error:', cacheError);
        }

        return NextResponse.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { message: 'An error occurred while deleting the note' },
            { status: 500 }
        );
    }
}

// Update to handle privacy setting changes and content updates
// Update PATCH to support moving notes between folders
export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const resolvedParams = await context.params;
        const noteId = resolvedParams.id;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to update notes' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { title, content, isPublic, folderId } = await req.json();

        // If folderId is provided, verify it's valid and user has access
        if (folderId !== undefined && folderId !== null) {
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

        // Check if the note exists and belongs to the user
        const note = await prisma.note.findUnique({
            where: { id: noteId },
            select: { authorId: true }  // Only select what we need for verification
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

        // Update the note with folder support
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(isPublic !== undefined && { isPublic }),
                ...(folderId !== undefined && { folderId: folderId || null })
            },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                createdAt: true,
                isPublic: true,
                authorId: true
            }
        });

        // Invalidate cache for this note (all users)
        try {
            await redis.del(`note:${noteId}:${userId}`);
            await redis.del(`note:${noteId}:anonymous`);
        } catch (cacheError) {
            console.error('Redis cache invalidation error:', cacheError);
        }

        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { message: 'An error occurred while updating the note' },
            { status: 500 }
        );
    }
}