import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Fetch a user profile by ID
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = context.params.id;
        const session = await getServerSession(authOptions);
        const isOwnProfile = session?.user?.id === userId;

        // Find the user with optimized query
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                image: true,
                // Only include email if the user is viewing their own profile
                ...(isOwnProfile ? { email: true } : {}),
                // Count public notes
                _count: {
                    select: {
                        notes: {
                            where: isOwnProfile ? {} : { isPublic: true },
                        },
                        folders: {
                            where: isOwnProfile ? {} : { isPublic: true },
                        },
                    },
                },
                // Include only the needed fields from notes based on auth status
                notes: {
                    where: isOwnProfile ? {} : { isPublic: true },
                    select: {
                        id: true,
                        title: true,
                        updatedAt: true,
                        createdAt: true,
                        isPublic: true,
                        authorId: true
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 5, // Limit to 5 most recent notes
                },
                // Include folders based on auth status
                folders: {
                    where: {
                        ...(isOwnProfile ? {} : { isPublic: true }),
                        parentId: null, // Only include root folders
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
                                notes: true,
                                subfolders: true,
                            },
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 5, // Limit to 5 most recent folders
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Transform the response to include counts
        const responseUser = {
            ...user,
            totalNotes: user._count.notes,
            totalFolders: user._count.folders,
            _count: undefined,
        };

        return NextResponse.json(responseUser);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the user profile' },
            { status: 500 }
        );
    }
}