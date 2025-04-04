import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = context.params.id;
        const session = await getServerSession(authOptions);

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                image: true,
                // Only include email if the user is viewing their own profile
                email: session?.user?.id === userId ? true : false,
                // Count their public notes
                _count: {
                    select: {
                        notes: {
                            where: {
                                isPublic: true,
                            },
                        },
                    },
                },
                // Include their public notes
                notes: {
                    where: {
                        isPublic: true,
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    take: 5, // Limit to 5 most recent notes
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Transform the response to include note counts
        const publicUser = {
            ...user,
            totalPublicNotes: user._count.notes,
            _count: undefined, // Remove the internal count object
        };

        return NextResponse.json(publicUser);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the user profile' },
            { status: 500 }
        );
    }
}