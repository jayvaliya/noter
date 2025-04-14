"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { FolderCard } from '@/components/folder-card';
import { FolderBreadcrumbs } from '@/components/folder-breadcrumbs';
import { NewFolderModal } from '@/components/new-folder-modal';
import { BsPlus, BsExclamationCircle, BsFolderPlus, BsArrowLeft } from 'react-icons/bs';
import Loading from '@/components/loading';

// Interface definitions
interface Folder {
    id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    isPublic: boolean;
    authorId: string;
    parentId: string | null;
    _count: {
        notes: number;
        subfolders: number;
    };
}

interface Note {
    id: string;
    title: string;
    updatedAt: Date;
    createdAt: Date;
    isPublic: boolean;
    authorId: string;
    isBookmarked: boolean;
}

interface Breadcrumb {
    id: string;
    name: string;
}

interface FolderContents {
    folder: {
        id: string;
        name: string;
        updatedAt: Date;
        createdAt: Date;
        isPublic: boolean;
        authorId: string;
        parentId: string | null;
    };
    subfolders: Folder[];
    notes: Note[];
    breadcrumbs: Breadcrumb[];
    isOwner: boolean;
}

// API response interfaces with string dates
interface ApiFolder {
    id: string;
    name: string;
    updatedAt: string;
    createdAt: string;
    isPublic: boolean;
    authorId: string;
    parentId: string | null;
    _count: {
        notes: number;
        subfolders: number;
    };
}

interface ApiNote {
    id: string;
    title: string;
    updatedAt: string;
    createdAt: string;
    isPublic: boolean;
    authorId: string;
    isBookmarked: boolean;
}

interface ApiFolderContents {
    folder: {
        id: string;
        name: string;
        updatedAt: string;
        createdAt: string;
        isPublic: boolean;
        authorId: string;
        parentId: string | null;
    };
    subfolders: ApiFolder[];
    notes: ApiNote[];
    breadcrumbs: Breadcrumb[];
    isOwner: boolean;
}

interface ApiError {
    message: string;
}

export default function FolderPage({ params }: { params: { id: string } }) {
    const folderId = params.id;
    const router = useRouter();
    const { data: session, status } = useSession();
    const [folderContents, setFolderContents] = useState<FolderContents | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    useEffect(() => {
        const fetchFolderContents = async () => {

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/folders/${folderId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Folder not found');
                    }
                    if (response.status === 403) {
                        // This will happen if the folder exists but is private and the user isn't authenticated
                        if (status === "unauthenticated") {
                            router.push('/signin');
                            return;
                        }
                        throw new Error('You do not have permission to view this folder');
                    }
                    const errorData = await response.json() as ApiError;
                    throw new Error(errorData.message || 'Failed to load folder');
                }

                const data: ApiFolderContents = await response.json();

                // Process dates
                const processedFolder = {
                    ...data,
                    folder: {
                        ...data.folder,
                        updatedAt: new Date(data.folder.updatedAt),
                        createdAt: new Date(data.folder.createdAt)
                    },
                    subfolders: data.subfolders.map((subfolder: ApiFolder) => ({
                        ...subfolder,
                        updatedAt: new Date(subfolder.updatedAt),
                        createdAt: new Date(subfolder.createdAt)
                    })),
                    notes: data.notes.map((note: ApiNote) => ({
                        ...note,
                        updatedAt: new Date(note.updatedAt),
                        createdAt: new Date(note.createdAt)
                    }))
                };

                setFolderContents(processedFolder);
            } catch (err) {
                console.error('Error fetching folder contents:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (status !== "loading") {
            fetchFolderContents();
        }
    }, [folderId, status, router]);

    const handleCreateSubfolder = async (name: string, isPublic: boolean) => {
        try {
            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    isPublic,
                    parentId: folderId
                })
            });

            if (!response.ok) {
                const data: ApiError = await response.json();
                throw new Error(data.message || 'Failed to create folder');
            }

            // Refresh folder contents
            const contentsResponse = await fetch(`/api/folders/${folderId}`);
            const contentsData: ApiFolderContents = await contentsResponse.json();

            // Process dates
            const processedFolder = {
                ...contentsData,
                folder: {
                    ...contentsData.folder,
                    updatedAt: new Date(contentsData.folder.updatedAt),
                    createdAt: new Date(contentsData.folder.createdAt)
                },
                subfolders: contentsData.subfolders.map((subfolder: ApiFolder) => ({
                    ...subfolder,
                    updatedAt: new Date(subfolder.updatedAt),
                    createdAt: new Date(subfolder.createdAt)
                })),
                notes: contentsData.notes.map((note: ApiNote) => ({
                    ...note,
                    updatedAt: new Date(note.updatedAt),
                    createdAt: new Date(note.createdAt)
                }))
            };

            setFolderContents(processedFolder);
        } catch (err) {
            console.error('Error creating subfolder:', err);
            throw err;
        }
    };

    const handleEditFolder = (subfolderId: string) => {
        // Implement edit functionality
        // This could open a modal or navigate to an edit page
        console.log('Edit folder:', subfolderId);
    };

    const handleDeleteFolder = async (subfolderId: string) => {
        if (confirm('Are you sure you want to delete this folder? All contents will be moved to this folder.')) {
            try {
                const response = await fetch(`/api/folders/${subfolderId}?keepContents=true`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const data = await response.json() as ApiError;
                    throw new Error(data.message || 'Failed to delete folder');
                }

                // Refresh folder contents
                const contentsResponse = await fetch(`/api/folders/${folderId}`);
                const contentsData = await contentsResponse.json() as ApiFolderContents;

                // Process dates
                const processedFolder = {
                    ...contentsData,
                    folder: {
                        ...contentsData.folder,
                        updatedAt: new Date(contentsData.folder.updatedAt),
                        createdAt: new Date(contentsData.folder.createdAt)
                    },
                    subfolders: contentsData.subfolders.map((subfolder: ApiFolder) => ({
                        ...subfolder,
                        updatedAt: new Date(subfolder.updatedAt),
                        createdAt: new Date(subfolder.createdAt)
                    })),
                    notes: contentsData.notes.map((note: ApiNote) => ({
                        ...note,
                        updatedAt: new Date(note.updatedAt),
                        createdAt: new Date(note.createdAt)
                    }))
                };

                setFolderContents(processedFolder);
            } catch (err) {
                console.error('Error deleting folder:', err);
                alert(err instanceof Error ? err.message : 'Failed to delete folder');
            }
        }
    };

    if (status === "loading" || isLoading) {
        return <Loading size="large" fullScreen={true} />;
    }

    if (error) {
        return (

            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href="/notes"
                            className="text-zinc-400 hover:text-white inline-flex items-center gap-1 mb-4"
                        >
                            <BsArrowLeft />
                            <span>Back to Notes</span>
                        </Link>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-center justify-center">
                        <BsExclamationCircle className="text-red-500 mr-3 flex-shrink-0" size={24} />
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!folderContents) {
        return (
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href="/notes"
                            className="text-zinc-400 hover:text-white inline-flex items-center gap-1 mb-4"
                        >
                            <BsArrowLeft />
                            <span>Back to Notes</span>
                        </Link>
                    </div>

                    <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 flex items-center justify-center">
                        <p className="text-zinc-400">Folder not found or you don{`'`}t have access</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <FolderBreadcrumbs
                            breadcrumbs={folderContents.breadcrumbs}
                            baseRoute="folders"
                        />
                    </div>

                    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{folderContents.folder.name}</h1>
                            <p className="mt-1 text-zinc-400">
                                {folderContents.subfolders.length} folders • {folderContents.notes.length} notes
                            </p>
                        </div>
                        {folderContents.isOwner && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsFolderModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md transition-colors"
                                >
                                    <BsFolderPlus />
                                    New Folder
                                </button>
                                <Link
                                    href={`/notes/new?folderId=${folderId}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-colors"
                                >
                                    <BsPlus />
                                    New Note
                                </Link>
                            </div>
                        )}
                    </header>

                    {/* Subfolders */}
                    {folderContents.subfolders.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold text-white mb-4">Folders</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {folderContents.subfolders.map(subfolder => (
                                    <FolderCard
                                        key={subfolder.id}
                                        id={subfolder.id}
                                        name={subfolder.name}
                                        updatedAt={subfolder.updatedAt}
                                        isPublic={subfolder.isPublic}
                                        isOwner={folderContents.isOwner}
                                        noteCount={subfolder._count.notes}
                                        subfolderCount={subfolder._count.subfolders}
                                        onEdit={handleEditFolder}
                                        onDelete={handleDeleteFolder}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {folderContents.notes.length > 0 ? "Notes" : "No Notes"}
                        </h2>
                        {folderContents.notes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {folderContents.notes.map(note => (
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
                            <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg p-8 text-center">
                                <p className="text-zinc-400 mb-4">This folder is empty.</p>
                                {folderContents.isOwner && (
                                    <Link
                                        href={`/notes/new?folderId=${folderId}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-colors"
                                    >
                                        <BsPlus />
                                        Create a Note
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Folder Modal */}
            <NewFolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onSubmit={handleCreateSubfolder}
                currentFolderId={folderId}
            />
        </>
    );
}