import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Get folder contents 
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const folderId = await context.params.id;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!folderId) {
            return NextResponse.json(
                { message: 'Folder ID is required' },
                { status: 400 }
            );
        }

        // Fetch the folder
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
            },
        });

        if (!folder) {
            return NextResponse.json(
                { message: 'Folder not found' },
                { status: 404 }
            );
        }

        // Check if user has access to the folder
        const isOwner = folder.authorId === userId;
        if (!folder.isPublic && !isOwner) {
            return NextResponse.json(
                { message: 'You do not have permission to view this folder' },
                { status: 403 }
            );
        }

        // Get subfolders
        const subfolders = await prisma.folder.findMany({
            where: {
                parentId: folderId,
                OR: [
                    { isPublic: true },
                    { authorId: userId }
                ]
            },
            include: {
                _count: {
                    select: {
                        notes: true,
                        subfolders: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Get notes in the folder
        const notes = await prisma.note.findMany({
            where: {
                folderId: folderId,
                OR: [
                    { isPublic: true },
                    { authorId: userId }
                ]
            },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                createdAt: true,
                isPublic: true,
                authorId: true,
                ...(userId ? {
                    bookmarks: {
                        where: { userId },
                        select: { id: true }
                    }
                } : {})
            },
            orderBy: {
                title: 'asc'
            }
        });

        // Process notes to include bookmark status
        const processedNotes = notes.map(note => ({
            ...note,
            isBookmarked: userId ? (note.bookmarks?.length > 0) : false,
            bookmarks: undefined
        }));

        // Get breadcrumbs (folder hierarchy)
        const breadcrumbs = await getBreadcrumbs(folderId);

        return NextResponse.json({
            folder,
            subfolders,
            notes: processedNotes,
            breadcrumbs,
            isOwner
        });
    } catch (error) {
        console.error('Error fetching folder contents:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching folder contents' },
            { status: 500 }
        );
    }
}

// Delete folder
export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const folderId = await context.params.id;
        const keepContents = req.nextUrl.searchParams.get('keepContents') === 'true';
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { message: 'You must be logged in to delete folders' },
                { status: 401 }
            );
        }

        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: { parent: true }
        });

        if (!folder) {
            return NextResponse.json(
                { message: 'Folder not found' },
                { status: 404 }
            );
        }

        if (folder.authorId !== userId) {
            return NextResponse.json(
                { message: 'You do not have permission to delete this folder' },
                { status: 403 }
            );
        }

        // If keepContents is true, move all content to parent folder
        if (keepContents) {
            const parentId = folder.parentId;

            // Move all notes to parent folder or root
            await prisma.note.updateMany({
                where: { folderId: folderId },
                data: { folderId: parentId }
            });

            // Move all subfolders to parent folder or root
            await prisma.folder.updateMany({
                where: { parentId: folderId },
                data: { parentId: parentId }
            });
        }

        // Delete the folder
        await prisma.folder.delete({
            where: { id: folderId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json(
            { message: 'An error occurred while deleting the folder' },
            { status: 500 }
        );
    }
}

// Helper function to get breadcrumbs
async function getBreadcrumbs(folderId: string) {
    const breadcrumbs = [];
    let currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentId: true }
    });

    if (currentFolder) {
        breadcrumbs.push({ id: currentFolder.id, name: currentFolder.name });

        while (currentFolder?.parentId) {
            currentFolder = await prisma.folder.findUnique({
                where: { id: currentFolder.parentId },
                select: { id: true, name: true, parentId: true }
            });

            if (currentFolder) {
                breadcrumbs.unshift({ id: currentFolder.id, name: currentFolder.name });
            }
        }
    }

    return breadcrumbs;
}