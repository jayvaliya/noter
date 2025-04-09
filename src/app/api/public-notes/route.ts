import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;

        // Check for authenticated user to handle bookmarks
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Fetch all public notes - with or without authentication
        let publicNotes;

        if (userId) {
            // For authenticated users: Include bookmark status
            publicNotes = await prisma.note.findMany({
                where: {
                    isPublic: true,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    },
                    // Include user's bookmarks to check if note is bookmarked
                    bookmarks: {
                        where: { userId },
                        select: { id: true },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                ...(limit ? { take: limit } : {}),
            });

            // Transform notes to include isBookmarked flag
            publicNotes = publicNotes.map(note => ({
                ...note,
                isBookmarked: note.bookmarks.length > 0,
                bookmarks: undefined, // Remove the bookmarks array from response
            }));
        } else {
            // For unauthenticated users: Standard query without bookmarks
            publicNotes = await prisma.note.findMany({
                where: {
                    isPublic: true,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                ...(limit ? { take: limit } : {}),
            });

            // Set isBookmarked to false for all notes
            publicNotes = publicNotes.map(note => ({
                ...note,
                isBookmarked: false,
            }));
        }

        return NextResponse.json(publicNotes);
    } catch (error) {
        console.error('Error fetching public notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching public notes' },
            { status: 500 }
        );
    }
}