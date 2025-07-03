"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { NoteCard } from '@/components/note-card';
import { FolderCard } from '@/components/folder-card';
import { BsExclamationCircle, BsGlobeCentralSouthAsia, BsSearch, BsArrowLeft, BsX } from 'react-icons/bs';
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

// Interface for the unified explore API response
interface ExploreApiResponse {
    folders: ApiFolder[];
    notes: ApiNote[];
    meta: {
        totalFolders: number;
        totalNotes: number;
        timestamp: string;
    };
}

export default function ExplorePage() {
    const [publicNotes, setPublicNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [originalPublicNotes, setOriginalPublicNotes] = useState<Note[]>([]);
    const [originalFolders, setOriginalFolders] = useState<Folder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState({ notes: [], folders: [], totalResults: 0 });
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicContent = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Use the new unified public explore endpoint
                const response = await fetch('/api/public/explore');

                if (!response.ok) {
                    throw new Error('Failed to fetch public content');
                }

                const data = await response.json() as ExploreApiResponse;

                // Process folder dates
                const processedFolders = data.folders.map((folder: ApiFolder) => ({
                    ...folder,
                    updatedAt: new Date(folder.updatedAt),
                    createdAt: new Date(folder.createdAt)
                }));

                // Process notes with dates
                const processedNotes = data.notes.map((note: ApiNote) => ({
                    ...note,
                    updatedAt: new Date(note.updatedAt),
                    createdAt: new Date(note.createdAt)
                }));

                setFolders(processedFolders);
                setOriginalFolders(processedFolders);
                setPublicNotes(processedNotes);
                setOriginalPublicNotes(processedNotes);
            } catch (err) {
                console.error('Error fetching public content:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicContent();
    }, []);

    // Search functionality
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            return;
        }

        setIsSearching(true);
        setIsSearchMode(true);
        setError(null);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&type=all&limit=50`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Search failed');
            }

            const data = await response.json();
            
            // Process notes with proper date conversion
            const processedNotes = data.notes.map((note: ApiNote) => ({
                ...note,
                updatedAt: new Date(note.updatedAt),
                createdAt: new Date(note.createdAt)
            }));

            // Process folders with proper date conversion
            const processedFolders = data.folders.map((folder: ApiFolder) => ({
                ...folder,
                updatedAt: new Date(folder.updatedAt),
                createdAt: new Date(folder.createdAt)
            }));

            // Update search results
            setSearchResults({
                notes: processedNotes,
                folders: processedFolders,
                totalResults: data.totalResults
            });

            // Update display
            setPublicNotes(processedNotes);
            setFolders(processedFolders);

        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
            // On error, show empty results
            setPublicNotes([]);
            setFolders([]);
            setSearchResults({ notes: [], folders: [], totalResults: 0 });
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Reset to default view
    const handleBackToDefault = () => {
        setSearchQuery('');
        setIsSearchMode(false);
        setPublicNotes(originalPublicNotes);
        setFolders(originalFolders);
        setSearchResults({ notes: [], folders: [], totalResults: 0 });
        setError(null);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        if (isSearchMode) {
            handleBackToDefault();
        }
    };

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
                        {isSearchMode && (
                            <button
                                onClick={handleBackToDefault}
                                className="ml-auto text-sm underline hover:no-underline"
                            >
                                Go back to explore
                            </button>
                        )}
                    </div>
                )}

                {/* Search Bar Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-full max-w-2xl">
                            <div className="flex items-center bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search notes, folders, or authors..."
                                    className="flex-1 bg-transparent text-white placeholder-zinc-400 px-4 py-3 focus:outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                                        title="Clear search"
                                    >
                                        <BsX className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleSearch}
                                    disabled={!searchQuery.trim() || isSearching}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-6 py-3 flex items-center gap-2 transition-colors"
                                >
                                    {isSearching ? (
                                        <>
                                            <Loading size="small" />
                                            <span className="hidden sm:inline">Searching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BsSearch className="w-4 h-4" />
                                            <span className="hidden sm:inline">Search</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back Button and Search Results Info */}
                    {isSearchMode && (
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleBackToDefault}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                            >
                                <BsArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Back to all content</span>
                            </button>
                            <div className="text-sm text-zinc-400">
                                {searchResults.totalResults > 0 
                                    ? `${searchResults.totalResults} result${searchResults.totalResults !== 1 ? 's' : ''} for "${searchQuery}"`
                                    : `No results for "${searchQuery}"`
                                }
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-3xl mb-10 font-bold text-white flex gap-2 items-center">
                    <BsGlobeCentralSouthAsia />
                    {isSearchMode ? "Search Results" : "The ocean of knowledge is yours to explore."}
                </div>
                {folders.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {isSearchMode ? "Matching Folders" : "Latest Public Folders"}
                        </h2>
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

                {/* Show message when no folders found in search */}
                {isSearchMode && folders.length === 0 && originalFolders.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Matching Folders</h2>
                        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-6 text-center">
                            <p className="text-zinc-400">
                                No folders found for {`"${searchQuery}"`}. Try a different search term.
                            </p>
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-6">
                    {isSearchMode ? "Matching Notes" : "Latest Public Notes"}
                </h2>

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
                                {isSearchMode 
                                    ? `No notes found for "${searchQuery}". Try a different search term.`
                                    : "No public notes available. Be the first to share!"
                                }
                            </p>
                            {status === "authenticated" && !isSearchMode && (
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