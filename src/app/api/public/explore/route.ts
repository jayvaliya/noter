import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth';

// Define interfaces for the unified response
interface ExploreFolder {
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

interface ExploreNote {
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

interface ExploreResponse {
    folders: ExploreFolder[];
    notes: ExploreNote[];
    meta: {
        totalFolders: number;
        totalNotes: number;
        appliedLimits: {
            folders: number;
            notes: number;
        };
        timestamp: string;
    };
}

export async function GET(req: NextRequest): Promise<NextResponse<ExploreResponse | { message: string }>> {
    try {
        const searchParams = req.nextUrl.searchParams;
        const notesLimit = searchParams.get('notesLimit') ? parseInt(searchParams.get('notesLimit') as string) : 50;
        const foldersLimit = searchParams.get('foldersLimit') ? parseInt(searchParams.get('foldersLimit') as string) : 50;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : null;

        // If general limit is provided, apply to both
        const finalNotesLimit = limit || notesLimit;
        const finalFoldersLimit = limit || foldersLimit;

        // Check for authenticated user to handle bookmarks
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Create cache key with userId
        const cacheKey = `explore:${userId || 'anonymous'}`;

        // Try to get from cache first
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                // Redis client may return already parsed object or string
                const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                return NextResponse.json(parsedData);
            }
        } catch (cacheError) {
            console.error('Cache read error:', cacheError);
        }

        // Fetch both folders and notes concurrently using Promise.all
        const [folders, notes] = await Promise.all([
            // Fetch public folders
            prisma.folder.findMany({
                where: {
                    isPublic: true,
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
                orderBy: {
                    updatedAt: 'desc',
                },
                take: finalFoldersLimit,
            }),

            // Fetch public notes
            prisma.note.findMany({
                where: {
                    isPublic: true,
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
                            image: true,
                        },
                    },
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
                take: finalNotesLimit,
            })
        ]);

        // Process notes with bookmark status
        const processedNotes = notes.map(note => ({
            ...note,
            isBookmarked: userId && 'bookmarks' in note ? note.bookmarks.length > 0 : false,
            bookmarks: undefined // Remove bookmarks array from response
        }));

        // Prepare the unified response
        const response: ExploreResponse = {
            folders,
            notes: processedNotes,
            meta: {
                totalFolders: folders.length,
                totalNotes: processedNotes.length,
                appliedLimits: {
                    folders: finalFoldersLimit,
                    notes: finalNotesLimit
                },
                timestamp: new Date().toISOString()
            }
        };

        // Cache for 30 seconds
        try {
            await redis.setex(cacheKey, 30, JSON.stringify(response));
        } catch (cacheError) {
            console.error('Cache write error:', cacheError);
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in explore API:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching explore content' },
            { status: 500 }
        );
    }
}
