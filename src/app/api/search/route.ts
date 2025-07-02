import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Define interfaces for search results
interface SearchNote {
    id: string;
    title: string;
    content: string;
    updatedAt: Date;
    createdAt: Date;
    isPublic: boolean;
    authorId: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    isBookmarked?: boolean;
}

interface SearchFolder {
    id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    isPublic: boolean;
    authorId: string;
    _count: {
        notes: number;
        subfolders: number;
    };
}

interface SearchResults {
    notes: SearchNote[];
    folders: SearchFolder[];
    totalResults: number;
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q')?.trim();
        const type = searchParams.get('type') || 'all'; // 'notes', 'folders', or 'all'
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 50;

        // Validate query
        if (!query || query.length < 2) {
            return NextResponse.json(
                { message: 'Search query must be at least 2 characters long' },
                { status: 400 }
            );
        }

        // Check for authenticated user to handle bookmarks
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const results: SearchResults = {
            notes: [],
            folders: [],
            totalResults: 0
        };

        // Search in notes if type is 'notes' or 'all'
        if (type === 'notes' || type === 'all') {
            const notes = await prisma.note.findMany({
                where: {
                    isPublic: true,
                    OR: [
                        {
                            title: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },
                        {
                            content: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },
                        {
                            author: {
                                name: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    updatedAt: true,
                    createdAt: true,
                    isPublic: true,
                    authorId: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    // Only include bookmark data if user is authenticated
                    ...(userId ? {
                        bookmarks: {
                            where: { userId },
                            select: { id: true }
                        }
                    } : {})
                },
                orderBy: [
                    {
                        // Prioritize title matches over content matches
                        title: 'asc'
                    },
                    {
                        updatedAt: 'desc'
                    }
                ],
                take: limit
            });

            // Process notes with bookmark status
            results.notes = notes.map(note => ({
                ...note,
                isBookmarked: userId && 'bookmarks' in note ? note.bookmarks.length > 0 : false,
                bookmarks: undefined // Remove bookmarks array from response
            }));
        }

        // Search in folders if type is 'folders' or 'all'
        if (type === 'folders' || type === 'all') {
            const folders = await prisma.folder.findMany({
                where: {
                    isPublic: true,
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                select: {
                    id: true,
                    name: true,
                    updatedAt: true,
                    createdAt: true,
                    isPublic: true,
                    authorId: true,
                    _count: {
                        select: {
                            notes: {
                                where: {
                                    isPublic: true
                                }
                            },
                            subfolders: {
                                where: {
                                    isPublic: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    {
                        name: 'asc'
                    },
                    {
                        updatedAt: 'desc'
                    }
                ],
                take: limit
            });

            results.folders = folders;
        }

        // Calculate total results
        results.totalResults = results.notes.length + results.folders.length;

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error in search API:', error);
        return NextResponse.json(
            { message: 'An error occurred while searching' },
            { status: 500 }
        );
    }
}
