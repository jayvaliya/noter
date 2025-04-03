"use client";

import { useState, useEffect, use } from 'react'; // Import use from React
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function NotePage({ params }: { params: { id: string } }) {
    // Unwrap params using use()
    const resolvedParams = use(params);
    const noteId = resolvedParams.id;

    const { status } = useSession();
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication status
        if (status === "unauthenticated") {
            router.push('/');
            return;
        }

        // Fetch the specific note
        const fetchNote = async () => {
            try {
                const response = await fetch(`/api/notes/${noteId}`); // Use noteId instead of params.id

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Note not found');
                    }
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to fetch note');
                }

                const data = await response.json();

                // Convert date strings to Date objects
                setNote({
                    ...data,
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                });
            } catch (err: any) {
                console.error('Error fetching note:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchNote();
        }
    }, [status, router, noteId]); // Replace params.id with noteId in the dependency array

    // Show loading state while checking authentication or fetching data
    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to dashboard</span>
                        </Link>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                        <p className="text-zinc-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // If no note data
    if (!note) {
        return (
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to dashboard</span>
                        </Link>
                    </div>
                    <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 text-center">
                        <p className="text-zinc-400">Note not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to dashboard</span>
                        </Link>
                    </div>
                </div>

                <article className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-white mb-4">{note.title}</h1>

                        <div className="text-zinc-500 text-sm mb-6">
                            Last updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                        </div>

                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    </div>
                </article>
            </div>
        </div>
    );
}