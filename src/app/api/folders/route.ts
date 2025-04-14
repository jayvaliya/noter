import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Create new folder
export async function POST(req: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'You must be logged in to create folders' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Parse request body
        const { name, isPublic = true, parentId = null } = await req.json();

        // Validate inputs
        if (!name) {
            return NextResponse.json(
                { message: 'Folder name is required' },
                { status: 400 }
            );
        }

        // If parentId is provided, check if it exists and belongs to the user
        if (parentId) {
            const parentFolder = await prisma.folder.findUnique({
                where: {
                    id: parentId,
                }
            });

            if (!parentFolder) {
                return NextResponse.json(
                    { message: 'Parent folder not found' },
                    { status: 404 }
                );
            }

            if (parentFolder.authorId !== userId) {
                return NextResponse.json(
                    { message: 'You do not have permission to create folders here' },
                    { status: 403 }
                );
            }
        }

        // Create the folder in the database
        const folder = await prisma.folder.create({
            data: {
                name,
                isPublic,
                authorId: userId,
                parentId,
            }
        });

        return NextResponse.json(folder, { status: 201 });
    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json(
            { message: 'An error occurred while creating the folder' },
            { status: 500 }
        );
    }
}

// Fetch all folders for the authenticated user
// This endpoint can be used to fetch folders for a specific parent folder or all folders if no parentId is provided
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Get the user ID if authenticated
        const userId = session?.user?.id;
        const parentId = req.nextUrl.searchParams.get('parentId') || null;

        if (!userId) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Fetch folders
        const folders = await prisma.folder.findMany({
            where: {
                authorId: userId,
                parentId: parentId === 'null' ? null : parentId || null,
            },
            include: {
                _count: {
                    select: {
                        notes: true,
                        subfolders: true,
                    }
                }
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching folders' },
            { status: 500 }
        );
    }
}