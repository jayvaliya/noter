"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BsBookmarkFill, BsExclamationCircle, BsArrowLeft } from 'react-icons/bs';
import { ProtectedRoute } from '@/components/protected-route';
import { NoteCard } from '@/components/note-card';
import Loading from '@/components/loading';

// Define proper author type
interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

// Interface for raw note data from API (dates as strings)
interface ApiNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    authorId: string;
    author: Author;
}

// Interface for processed note with Date objects
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isBookmarked: boolean;
    isPublic: boolean;
    authorId: string;
    author: Author;
}

// API error response type
interface ApiError {
    message: string;
}

export default function BookmarksPage() {
    const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
    const { status, data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookmarkedNotes = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/bookmarks');

                if (!response.ok) {
                    const errorData = await response.json() as ApiError;
                    throw new Error(errorData.message || 'Failed to fetch bookmarks');
                }

                const data = await response.json() as ApiNote[];

                // Transform and add dates with proper typing
                const notesWithDates: Note[] = data.map((note) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt),
                    isBookmarked: true,
                }));

                setBookmarkedNotes(notesWithDates);
            } catch (err) {
                console.error('Error fetching bookmarked notes:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchBookmarkedNotes();
        }
    }, [status]);

    if (isLoading) {
        return (
            <Loading size="large" fullScreen={true} />
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/notes"
                                className="mr-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <BsArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center">
                                    <BsBookmarkFill className="mr-2 text-emerald-500" />
                                    Your Bookmarks
                                </h1>
                                <p className="text-zinc-400 mt-2">
                                    Notes you{`'`}ve saved for later
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center">
                            <BsExclamationCircle className="mr-2 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarkedNotes.length > 0 ? (
                            bookmarkedNotes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    id={note.id}
                                    title={note.title}
                                    content={note.content}
                                    createdAt={note.createdAt}
                                    updatedAt={note.updatedAt}
                                    author={note.author}
                                    isBookmarked={true}
                                    isPublic={note.isPublic}
                                    isOwner={note.authorId === session?.user?.id}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                                <p className="text-zinc-400 mb-4">
                                    You haven{`'`}t bookmarked any notes yet
                                </p>
                                <Link
                                    href="/explore"
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Explore notes to bookmark
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}