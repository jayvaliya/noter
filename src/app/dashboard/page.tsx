"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { BsPlus, BsExclamationCircle } from 'react-icons/bs';
import { ProtectedRoute } from '@/components/protected-route';

// Note interface
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function Dashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
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
            // Fetch notes from API
            const fetchNotes = async () => {
                try {
                    const response = await fetch('/api/notes');

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.message || 'Failed to fetch notes');
                    }

                    const data = await response.json();

                    // Convert date strings to Date objects
                    const notesWithDates = data.map((note: any) => ({
                        ...note,
                        createdAt: new Date(note.createdAt),
                        updatedAt: new Date(note.updatedAt),
                    }));

                    setNotes(notesWithDates);
                } catch (err: any) {
                    console.error('Error fetching notes:', err);
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchNotes();
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
        </ProtectedRoute>

    );
}