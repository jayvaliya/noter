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

        // Fetch public notes with only the required fields
        const publicNotes = await prisma.note.findMany({
            where: {
                isPublic: true,
            },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                createdAt: true,
                isPublic: true,
                authorId: true,
                // Only include bookmark data if user is authenticated
                ...(userId ? {
                    bookmarks: {
                        where: { userId },
                        select: { id: true },
                    }
                } : {})
            },
            orderBy: {
                updatedAt: 'desc',
            },
            ...(limit ? { take: limit } : {}),
        });

        // Process bookmark status
        const processedNotes = publicNotes.map(note => ({
            id: note.id,
            title: note.title,
            updatedAt: note.updatedAt,
            createdAt: note.createdAt,
            isPublic: note.isPublic,
            authorId: note.authorId,
            // Set isBookmarked based on whether user is authenticated and has bookmarked the note
            isBookmarked: userId ? ('bookmarks' in note && note.bookmarks.length > 0) : false
        }));

        return NextResponse.json(processedNotes);
    } catch (error) {
        console.error('Error fetching public notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching public notes' },
            { status: 500 }
        );
    }
}