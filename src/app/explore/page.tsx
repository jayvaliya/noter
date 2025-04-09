"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { BsExclamationCircle } from 'react-icons/bs';
import { IoMdGlobe } from 'react-icons/io';
import Loading from '@/components/loading';

// Updated Author interface
interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

// Interface for API response notes (with string dates)
interface ApiNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    authorId: string;
    author: Author;
    isBookmarked?: boolean;
}

// Interface for processed notes (with Date objects)
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isPublic: boolean;
    authorId: string;
    author: Author;
    isBookmarked?: boolean;
}

// API error response type
interface ApiError {
    message: string;
}

export default function ExplorePage() {
    const [publicNotes, setPublicNotes] = useState<Note[]>([]);
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch public notes
        const fetchPublicNotes = async () => {
            setIsLoading(true);
            try {
                // Use the public notes API
                const response = await fetch('/api/public-notes');

                if (!response.ok) {
                    const errorData = await response.json() as ApiError;
                    throw new Error(errorData.message || 'Failed to fetch public notes');
                }

                const notesData = await response.json() as ApiNote[];

                // Convert date strings to Date objects
                const notesWithDates: Note[] = notesData.map((note: ApiNote) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt),
                }));

                setPublicNotes(notesWithDates);
            } catch (err) {
                console.error('Error fetching public notes:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicNotes();
    }, []);

    // Show loading state
    if (isLoading) {
        return <Loading fullScreen size="large" />;
    }

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center">
                            <IoMdGlobe className="mr-2" />
                            Explore the world of knowledge
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Browse through notes shared by the community
                        </p>
                    </div>

                    {status === "authenticated" && (
                        <Link
                            href="/notes"
                            className="mt-4 md:mt-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                        >
                            View Your Notes
                        </Link>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center">
                        <BsExclamationCircle className="mr-2 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicNotes.length > 0 ? (
                        publicNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                content={note.content}
                                createdAt={note.createdAt}
                                updatedAt={note.updatedAt}
                                author={note.author}
                                isBookmarked={note.isBookmarked}
                                isPublic={note.isPublic}
                                isOwner={note.authorId === session?.user?.id}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                            <p className="text-zinc-400">
                                No public notes available. Be the first to share!
                            </p>
                            {status === "authenticated" && (
                                <Link
                                    href="/notes/new"
                                    className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Create a note
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}