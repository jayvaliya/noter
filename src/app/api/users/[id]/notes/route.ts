import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const searchParams = new URL(req.url).searchParams;
        const skip = parseInt(searchParams.get('skip') || '0');
        const take = parseInt(searchParams.get('take') || '10');

        // Find the user's public notes with pagination
        const notes = await prisma.note.findMany({
            where: {
                authorId: userId,
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
            skip,
            take,
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching user notes:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching user notes' },
            { status: 500 }
        );
    }
}