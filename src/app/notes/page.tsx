"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { BsPlus, BsExclamationCircle, BsBookmark } from 'react-icons/bs';
import { ProtectedRoute } from '@/components/protected-route';

// Define types for API responses
interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

// Raw API note format (dates as strings)
interface ApiNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isBookmarked?: boolean;
    isPublic?: boolean;
    authorId: string;
    author: Author;
}

// Note interface with date objects
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isBookmarked?: boolean;
    isPublic?: boolean;
    authorId: string;
    author: Author;
}

// API bookmark response
interface ApiBookmark {
    id: string;
    noteId: string;
    userId: string;
    createdAt: string;
    note: ApiNote;
}

// API error response type
interface ApiError {
    message: string;
}

export default function Dashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication status
        if (status === "unauthenticated") {
            router.push('/');
            return;
        }

        if (status === "authenticated") {
            // Fetch notes and bookmarks
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    // Fetch all notes
                    const notesResponse = await fetch('/api/notes');

                    if (!notesResponse.ok) {
                        const data = await notesResponse.json() as ApiError;
                        throw new Error(data.message || 'Failed to fetch notes');
                    }

                    const notesData = await notesResponse.json() as ApiNote[];

                    // Convert date strings to Date objects
                    const notesWithDates: Note[] = notesData.map((note: ApiNote) => ({
                        ...note,
                        createdAt: new Date(note.createdAt),
                        updatedAt: new Date(note.updatedAt),
                    }));

                    setNotes(notesWithDates);

                    // Fetch bookmarked notes
                    const bookmarksResponse = await fetch('/api/bookmarks');

                    if (!bookmarksResponse.ok) {
                        const data = await bookmarksResponse.json() as ApiError;
                        throw new Error(data.message || 'Failed to fetch bookmarks');
                    }

                    // Add these logs right after fetching the bookmark data
                    const bookmarksData = await bookmarksResponse.json() as ApiBookmark[];

                    // Extract notes from bookmarks and convert dates with proper error handling
                    const bookmarkedNotesWithDates: Note[] = bookmarksData
                        .filter((bookmark: ApiBookmark) => bookmark && bookmark.note) // Filter out any invalid bookmarks
                        .map((bookmark: ApiBookmark) => ({
                            ...bookmark.note,
                            createdAt: new Date(bookmark.note.createdAt),
                            updatedAt: new Date(bookmark.note.updatedAt),
                            isBookmarked: true, // Explicitly set bookmark status
                        }));

                    setBookmarkedNotes(bookmarkedNotesWithDates);
                } catch (err) {
                    console.error('Error fetching data:', err);
                    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }
    }, [status, router]);

    // Show loading state while checking authentication or fetching data
    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                        <h1 className="text-3xl font-bold text-white">
                            Your Notes
                        </h1>

                        <Link
                            href="/notes/new"
                            className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <BsPlus size={20} />
                            New Note
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center">
                            <BsExclamationCircle className="mr-2 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Bookmarked notes section */}
                    {bookmarkedNotes.length > 0 && (
                        <div className="mb-10">
                            <div className="flex items-center mb-4">
                                <BsBookmark className="text-emerald-500 mr-2" />
                                <h2 className="text-xl font-semibold text-white">Bookmarked Notes</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookmarkedNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        id={note.id}
                                        title={note.title}
                                        content={note.content}
                                        createdAt={note.createdAt}
                                        updatedAt={note.updatedAt}
                                        author={note.author}  // Pass the author object
                                        isBookmarked={note.isBookmarked}
                                        isPublic={note.isPublic}
                                        isOwner={note.authorId === session?.user?.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All notes section */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">All Notes</h2>
                        {notes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map(note => (
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
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                                <p className="text-zinc-400">
                                    {error ? 'Unable to load your notes.' : 'You haven\'t created any notes yet.'}
                                </p>
                                {!error && (
                                    <Link
                                        href="/notes/new"
                                        className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <BsPlus size={20} />
                                        Create your first note
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}