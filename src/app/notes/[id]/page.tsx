"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BsArrowLeft, BsBookmark, BsBookmarkFill, BsGlobe, BsLock, BsPersonFill } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

// Add interfaces for API responses
interface ApiAuthor {
    id: string;
    name: string | null;
    image: string | null;
}

interface ApiNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isBookmarked?: boolean;
    isPublic: boolean;
    authorId: string;
    author: ApiAuthor;
}

interface ApiError {
    message: string;
}

// Updated Note interface
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isBookmarked?: boolean;
    isPublic: boolean;
    authorId: string;
    author: {
        name: string | null;
        image: string | null;
    };
}

export default function NotePage({ params }: { params: { id: string } }) {
    const noteId = params.id;

    const { data: session, status } = useSession();
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                // Use string concatenation instead of template literals for safety
                const response = await fetch('/api/notes/' + noteId);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Note not found');
                    }
                    if (response.status === 403) {
                        throw new Error('You do not have permission to view this note');
                    }
                    const data = await response.json() as ApiError;
                    throw new Error(data.message || 'Failed to fetch note');
                }

                const data = await response.json() as ApiNote;

                // Set note data
                setNote({
                    ...data,
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                });

                // Check if user is the owner (only for authenticated users)
                setIsOwner(status === "authenticated" && session?.user?.id === data.authorId);

                // Set bookmark state (only relevant for authenticated users)
                setIsBookmarked(status === "authenticated" && !!data.isBookmarked);
            } catch (err) {
                console.error('Error fetching note:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNote();
    }, [status, session, router, noteId]);

    const toggleBookmark = async () => {
        if (status !== "authenticated") return;

        setIsBookmarkLoading(true);
        try {
            const method = isBookmarked ? 'DELETE' : 'POST';
            // Use string concatenation instead of template literals
            const response = await fetch('/api/bookmarks/' + noteId, {
                method: method,
            });

            if (response.ok) {
                setIsBookmarked(!isBookmarked);
            } else {
                const data = await response.json() as ApiError;
                console.error('Error toggling bookmark:', data.message);
            }
        } catch (err) {
            console.error('Error toggling bookmark:', err);
            // Use instanceof to check if it's an Error object
            if (err instanceof Error) {
                console.error('Error message:', err.message);
            }
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    const togglePrivacy = async () => {
        if (!isOwner) return;

        try {
            // Use string concatenation instead of template literals
            const response = await fetch('/api/notes/' + noteId, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isPublic: !note?.isPublic,
                }),
            });

            if (response.ok) {
                setNote(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null);
            } else {
                const data = await response.json() as ApiError;
                console.error('Error toggling note privacy:', data.message);
            }
        } catch (err) {
            console.error('Error toggling note privacy:', err);
            // Use instanceof to check if it's an Error object
            if (err instanceof Error) {
                console.error('Error message:', err.message);
            }
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/notes"
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

    if (!note) {
        return (
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/notes"
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
                            href="/notes"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back</span>
                        </Link>
                    </div>

                    {note && (
                        <div className="flex items-center">
                            {note.isPublic ? (
                                <span className="flex items-center text-sm px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                                    <BsGlobe className="mr-1" /> Public
                                </span>
                            ) : (
                                <span className="flex items-center text-sm px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-700">
                                    <BsLock className="mr-1" /> Private
                                </span>
                            )}

                            {isOwner && (
                                <button
                                    onClick={togglePrivacy}
                                    className="ml-2 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                                    title={note.isPublic ? "Make Private" : "Make Public"}
                                >
                                    {note.isPublic ? <BsLock /> : <BsGlobe />}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <article className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-white mb-4">{note.title}</h1>

                        {/* Add author info */}
                        <div className="flex items-center mb-6">
                            <Link
                                href={"/profile/" + note.authorId}
                                className="flex items-center group hover:bg-zinc-800/70 px-3 py-2 rounded-full transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 mr-2 ring-2 ring-zinc-600 group-hover:ring-emerald-500/50 transition-all">
                                    {note.author?.image ? (
                                        <Image
                                            src={note.author.image}
                                            alt={note.author.name || "Author"}
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BsPersonFill className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                                        {note.author?.name || "Unknown author"}
                                    </span>
                                    <div className="text-xs text-zinc-500">
                                        Last updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />

                        <div className="mt-8 flex justify-end space-x-4">
                            {status === "authenticated" && (
                                <button
                                    onClick={toggleBookmark}
                                    disabled={isBookmarkLoading}
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                    title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                                >
                                    {isBookmarkLoading ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-zinc-300 border-t-transparent rounded-full"></div>
                                    ) : isBookmarked ? (
                                        <BsBookmarkFill className="text-emerald-500" />
                                    ) : (
                                        <BsBookmark />
                                    )}
                                    <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}