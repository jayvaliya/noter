import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to view bookmarks' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get user's bookmarked notes with only necessary fields
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: userId,
            },
            select: {
                note: {
                    select: {
                        id: true,
                        title: true,
                        updatedAt: true,
                        createdAt: true,
                        isPublic: true,
                        authorId: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to a simpler format with bookmark flag
        const bookmarkedNotes = bookmarks.map(bookmark => ({
            ...bookmark.note,
            isBookmarked: true
        }));

        return NextResponse.json(bookmarkedNotes);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching bookmarks' },
            { status: 500 }
        );
    }
}