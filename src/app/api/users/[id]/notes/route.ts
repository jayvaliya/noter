import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const session = await getServerSession(authOptions);
        const isOwner = session?.user?.id === userId;

        // Build where clause based on ownership
        const whereClause = isOwner
            ? { authorId: userId }
            : { authorId: userId, isPublic: true };

        // Get all notes without pagination
        const notes = await prisma.note.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                createdAt: true,
                isPublic: true,
                authorId: true,
                folderId: true,
                author: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                ...(isOwner ? {
                    bookmarks: {
                        where: { userId },
                        select: { id: true }
                    }
                } : {})
            }
        });

        // Format notes with isBookmarked flag
        const formattedNotes = notes.map(note => ({
            ...note,
            isBookmarked: isOwner ? note.bookmarks?.length > 0 : undefined,
            bookmarks: undefined // Remove the raw bookmarks data
        }));

        // Get folders - show all public folders regardless of parentId
        const folderWhereClause = isOwner
            ? { authorId: userId } // All folders for owner
            : { authorId: userId, isPublic: true }; // Only public folders for others

        const folders = await prisma.folder.findMany({
            where: folderWhereClause,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        notes: true,
                        subfolders: true,
                    }
                }
            }
        });

        // Get bookmarks (only for owner)
        let bookmarks = null;
        if (isOwner) {
            bookmarks = await prisma.bookmark.findMany({
                where: { userId },
                select: {
                    note: {
                        select: {
                            id: true,
                            title: true,
                            updatedAt: true,
                            createdAt: true,
                            isPublic: true,
                            authorId: true,
                            author: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        // Compile the response - simplified without pagination metadata
        const response = {
            notes: formattedNotes,
            folders: folders,
            ...(bookmarks && {
                bookmarks: bookmarks.map(b => ({
                    ...b.note,
                    isBookmarked: true
                }))
            })
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching user content:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching user content' },
            { status: 500 }
        );
    }
}