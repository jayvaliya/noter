import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {

        // Get any query parameters
        const parentId = req.nextUrl.searchParams.get('parentId') || null;

        // Find public folders
        const folders = await prisma.folder.findMany({
            where: {
                isPublic: true,
                parentId: parentId === 'null' ? null : parentId || null,
            },
            include: {
                _count: {
                    select: {
                        notes: true,
                        subfolders: true,
                    }
                },
                author: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc', // Most recent first for explore page
            },
        });

        return NextResponse.json(folders);
    } catch (error) {
        console.error('Error fetching public folders:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching public folders' },
            { status: 500 }
        );
    }
}