import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'You must be logged in to view notes' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;

        // Get the note
        const note = await prisma.note.findUnique({
            where: {
                id: params.id,
                authorId: userId, // Make sure the note belongs to the user
            },
        });

        if (!note) {
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the note' },
            { status: 500 }
        );
    }
}


// DELETE a note
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("DELETE request received for note ID:", params.id);

        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.log("Unauthorized: No valid session");
            return NextResponse.json(
                { message: 'You must be logged in to delete notes' },
                { status: 401 }
            );
        }

        // Get user ID from session
        const userId = session.user.id;
        console.log("User ID from session:", userId);

        // First check if the note exists
        const note = await prisma.note.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!note) {
            console.log("Note not found with ID:", params.id);
            return NextResponse.json(
                { message: 'Note not found' },
                { status: 404 }
            );
        }

        console.log("Found note:", note);

        // Check if the user owns the note
        if (note.authorId !== userId) {
            console.log("Permission denied: Note belongs to", note.authorId, "not", userId);
            return NextResponse.json(
                { message: 'You do not have permission to delete this note' },
                { status: 403 }
            );
        }

        // Delete the note
        await prisma.note.delete({
            where: {
                id: params.id,
            },
        });

        console.log("Note deleted successfully");

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error("Error in DELETE handler:", error);
        return NextResponse.json(
            { message: 'An error occurred while deleting the note' },
            { status: 500 }
        );
    }
}