"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { FolderCard } from '@/components/folder-card';
import { BsExclamationCircle } from 'react-icons/bs';
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

// Interface for API response folders (with string dates)
interface ApiFolder {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    authorId: string;
    _count: {
        notes: number;
        subfolders: number;
    };
}

// Interface for processed folders (with Date objects)
interface Folder {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    isPublic: boolean;
    authorId: string;
    _count: {
        notes: number;
        subfolders: number;
    };
}

// API error response type
interface ApiError {
    message: string;
}

export default function ExplorePage() {
    const [publicNotes, setPublicNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicContent = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Use the dedicated public folders endpoint
                const foldersResponse = await fetch('/api/public/folders');

                if (!foldersResponse.ok) {
                    throw new Error('Failed to fetch public folders');
                }

                const foldersData = await foldersResponse.json();

                // Process folder dates
                const processedFolders = foldersData.map((folder: ApiFolder) => ({
                    ...folder,
                    updatedAt: new Date(folder.updatedAt),
                    createdAt: new Date(folder.createdAt)
                }));

                setFolders(processedFolders);

                // Use the dedicated public notes endpoint 
                const notesResponse = await fetch('/api/public/notes');

                if (!notesResponse.ok) {
                    const errorData = await notesResponse.json() as ApiError;
                    throw new Error(errorData.message || 'Failed to fetch public notes');
                }

                const notesData = await notesResponse.json() as ApiNote[];

                // Process notes with dates
                const processedNotes = notesData.map((note: ApiNote) => ({
                    ...note,
                    updatedAt: new Date(note.updatedAt),
                    createdAt: new Date(note.createdAt)
                }));

                setPublicNotes(processedNotes);
            } catch (err) {
                console.error('Error fetching public content:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicContent();
    }, []);

    // Show loading state
    if (isLoading) {
        return <Loading fullScreen size="large" />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center">
                        <BsExclamationCircle className="mr-2 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {folders.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Public Folders</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {folders.map(folder => (
                                <FolderCard
                                    key={folder.id}
                                    id={folder.id}
                                    name={folder.name}
                                    updatedAt={folder.updatedAt}
                                    isPublic={folder.isPublic}
                                    isOwner={folder.authorId === session?.user?.id}
                                    noteCount={folder._count.notes}
                                    subfolderCount={folder._count.subfolders}
                                    onEdit={() => { }}  // Not needed in explore view
                                    onDelete={() => { }}  // Not needed in explore view
                                />
                            ))}
                        </div>
                    </div>
                )}
                <h2 className="text-2xl font-bold text-white mb-6">Public Notes</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicNotes.length > 0 ? (
                        publicNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                updatedAt={note.updatedAt}
                                isBookmarked={note.isBookmarked}
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