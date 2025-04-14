"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { FolderCard } from '@/components/folder-card';
import { NewFolderModal } from '@/components/new-folder-modal';
import { BsPlus, BsExclamationCircle, BsBookmark, BsFolder, BsFolderPlus } from 'react-icons/bs';
import { ProtectedRoute } from '@/components/protected-route';
import Loading from '@/components/loading';

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

// API error response type
interface ApiError {
    message: string;
}

// Define folder type
interface Folder {
    id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    isPublic: boolean;
    authorId: string;
    _count: {
        notes: number;
        subfolders: number;
    };
}

// Add this with your other interfaces
interface ApiFolder {
    id: string;
    name: string;
    updatedAt: string;  // API returns dates as strings
    createdAt: string;
    isPublic: boolean;
    authorId: string;
    _count: {
        notes: number;
        subfolders: number;
    };
}

export default function Dashboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotes, setTotalNotes] = useState(0);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!session?.user?.id) return;

            // Use the new unified endpoint with pagination
            const response = await fetch(`/api/users/${session.user.id}/notes?page=1&pageSize=10`);

            if (!response.ok) {
                throw new Error('Failed to load content');
            }

            const data = await response.json();

            // Process notes with proper date objects
            const processedNotes = data.notes.map((note: ApiNote) => ({
                ...note,
                updatedAt: new Date(note.updatedAt),
                createdAt: new Date(note.createdAt)
            }));
            setNotes(processedNotes);
            setTotalNotes(data.notes.total);
            setCurrentPage(data.notes.page);

            // Process folders
            const processedFolders = data.folders.map((folder: ApiFolder) => ({
                ...folder,
                updatedAt: new Date(folder.updatedAt),
                createdAt: new Date(folder.createdAt)
            }));
            setFolders(processedFolders);

            // Process bookmarks if available
            if (data.bookmarks) {
                const processedBookmarks = data.bookmarks.map((note: ApiNote) => ({
                    ...note,
                    updatedAt: new Date(note.updatedAt),
                    createdAt: new Date(note.createdAt)
                }));
                setBookmarkedNotes(processedBookmarks);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const loadMoreNotes = async () => {
        if (!session?.user?.id) return;

        try {
            const nextPage = currentPage + 1;
            const response = await fetch(
                `/api/users/${session.user.id}/notes?page=${nextPage}&pageSize=10`
            );

            if (!response.ok) {
                throw new Error('Failed to load more notes');
            }

            const data = await response.json();

            // Process and append the new notes
            const processedNotes = data.notes.items.map((note: ApiNote) => ({
                ...note,
                updatedAt: new Date(note.updatedAt),
                createdAt: new Date(note.createdAt)
            }));

            setNotes(prev => [...prev, ...processedNotes]);
            setCurrentPage(nextPage);
        } catch (err) {
            console.error('Error loading more notes:', err);
        }
    };

    useEffect(() => {
        // Check authentication status
        if (status === "unauthenticated") {
            router.push('/signin');
            return;
        }

        if (status === "authenticated") {
            fetchData();
        }
    }, [status, router, fetchData, session]);

    const handleCreateFolder = async (name: string, isPublic: boolean) => {
        try {
            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    isPublic,
                    parentId: null // Creating at root level
                })
            });

            if (!response.ok) {
                const data = await response.json() as ApiError;
                throw new Error(data.message || 'Failed to create folder');
            }

            // Refresh folders list after creation
            const foldersResponse = await fetch('/api/folders');
            const foldersData = await foldersResponse.json() as ApiFolder[];

            const processedFolders = foldersData.map((folder: ApiFolder) => ({
                ...folder,
                updatedAt: new Date(folder.updatedAt),
                createdAt: new Date(folder.createdAt)
            }));

            setFolders(processedFolders);
        } catch (err) {
            console.error('Error creating folder:', err);
            throw err;
        }
    };

    const handleEditFolder = (folderId: string) => {
        // Navigate to edit page or show edit modal
        // This is a placeholder - implement as needed
        console.log('Edit folder:', folderId);
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (confirm('Are you sure you want to delete this folder? All contents will be moved to the root level.')) {
            try {
                const response = await fetch(`/api/folders/${folderId}?keepContents=true`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const data = await response.json() as ApiError;
                    throw new Error(data.message || 'Failed to delete folder');
                }

                // Refresh folders list
                const foldersResponse = await fetch('/api/folders');
                const foldersData = await foldersResponse.json() as ApiFolder[];

                const processedFolders = foldersData.map((folder: ApiFolder) => ({
                    ...folder,
                    updatedAt: new Date(folder.updatedAt),
                    createdAt: new Date(folder.createdAt)
                }));

                setFolders(processedFolders);

                // Also refresh notes since contents are moved to root
                const notesResponse = await fetch('/api/notes?folderId=null');
                const notesData = await notesResponse.json() as ApiNote[];

                const processedNotes = notesData.map((note: ApiNote) => ({
                    ...note,
                    updatedAt: new Date(note.updatedAt),
                    createdAt: new Date(note.createdAt)
                }));

                setNotes(processedNotes);
            } catch (err) {
                console.error('Error deleting folder:', err);
                alert(err instanceof Error ? err.message : 'Failed to delete folder');
            }
        }
    };

    // Show loading state while checking authentication or fetching data
    if (status === "loading" || isLoading) {
        return <Loading fullScreen size="large" />;
    }

    const shouldShowLoadMore = notes.length < totalNotes;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Notes</h1>
                            <p className="mt-1 text-zinc-400">Manage your personal notes and folders</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsFolderModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md transition-colors"
                            >
                                <BsFolderPlus />
                                New Folder
                            </button>
                            <Link
                                href="/notes/new"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-colors"
                            >
                                <BsPlus />
                                New Note
                            </Link>
                        </div>
                    </header>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 flex items-center">
                            <BsExclamationCircle className="mr-2 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}


                    {/* Folders section */}
                    {folders.length > 0 && (
                        <div className="mb-10">
                            <div className="flex items-center mb-4">
                                <BsFolder className="text-yellow-500 mr-2" />
                                <h2 className="text-xl font-semibold text-white">Folders</h2>
                            </div>
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
                                        onEdit={handleEditFolder}
                                        onDelete={handleDeleteFolder}
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
                                        updatedAt={note.updatedAt}
                                        isBookmarked={note.isBookmarked}
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
                    {/* Bookmarked notes section */}
                    {bookmarkedNotes.length > 0 && (
                        <div className="my-10">
                            <div className="flex items-center mb-4">
                                <BsBookmark className="text-emerald-500 mr-2" />
                                <h2 className="text-xl font-semibold text-white">Bookmarks</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookmarkedNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        id={note.id}
                                        title={note.title}
                                        updatedAt={note.updatedAt}
                                        isBookmarked={note.isBookmarked}
                                        isOwner={note.authorId === session?.user?.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {shouldShowLoadMore && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreNotes}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Folder Modal */}
            <NewFolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onSubmit={handleCreateFolder}
            />
        </ProtectedRoute>
    );
}