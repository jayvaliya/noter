import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'You must be logged in to view bookmarks' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get user's bookmarked notes with author information
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: userId,
            },
            include: {
                note: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Extract the notes from bookmarks and include bookmark status
        const bookmarkedNotes = bookmarks.map(bookmark => {
            return {
                ...bookmark.note,
                isBookmarked: true,
            };
        });

        return NextResponse.json(bookmarkedNotes);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching bookmarks' },
            { status: 500 }
        );
    }
}