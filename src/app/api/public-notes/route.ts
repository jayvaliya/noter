import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;

        // Fetch all public notes without requiring authentication
        // Now including author details
        const publicNotes = await prisma.note.findMany({
            where: {
                isPublic: true,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            ...(limit ? { take: limit } : {}),
        });

        return NextResponse.json(publicNotes);
    } catch (error) {
        console.error('Error fetching public notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching public notes' },
            { status: 500 }
        );
    }
}