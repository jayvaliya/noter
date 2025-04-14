"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BsPersonFill, BsBookmarkFill, BsArrowLeft, BsGlobe, BsFolder } from 'react-icons/bs';
import { NoteCard } from '@/components/note-card';
import { FolderCard } from '@/components/folder-card';
import Loading from '@/components/loading';

// API response note interface (with string dates)
interface ApiNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    authorId: string;
    isBookmarked?: boolean;
}

// API response folder interface (with string dates)
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

// Processed user profile with Date objects
interface UserProfile {
    id: string;
    name: string;
    image: string | null;
    email?: string;
    totalNotes: number;
    totalFolders: number;
    notes: Array<{
        id: string;
        title: string;
        updatedAt: Date;
        createdAt: Date;
        isPublic: boolean;
        authorId: string;
        isBookmarked?: boolean;
    }>;
    folders: Array<{
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
    }>;
}

export default function ProfilePage() {
    const params = useParams();
    const userId = params?.id as string;
    const router = useRouter();
    const { data: session } = useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isOwnProfile = session?.user?.id === userId;

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch the user profile data
                const userResponse = await fetch(`/api/users/${userId}`);

                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        throw new Error('User not found');
                    }
                    throw new Error('Failed to fetch user data');
                }

                const userData = await userResponse.json();

                // Process dates in the profile data
                const processedProfile = {
                    ...userData,
                    notes: userData.notes.map((note: ApiNote) => ({
                        ...note,
                        updatedAt: new Date(note.updatedAt),
                        createdAt: new Date(note.createdAt)
                    })),
                    folders: userData.folders.map((folder: ApiFolder) => ({
                        ...folder,
                        updatedAt: new Date(folder.updatedAt),
                        createdAt: new Date(folder.createdAt)
                    }))
                };

                setProfile(processedProfile);

                // Fetch additional content if needed in the future
                // For now, the profile endpoint should return everything we need

            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Function to handle folder actions
    const handleFolderEdit = (folderId: string) => {
        // This would be implemented as needed but likely redirect to edit page
        router.push(`/folders/${folderId}/edit`);
    };

    const handleFolderDelete = async (folderId: string) => {
        if (confirm('Are you sure you want to delete this folder?')) {
            try {
                const response = await fetch(`/api/folders/${folderId}?keepContents=true`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete folder');
                }

                // Refresh the profile data
                setProfile(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        folders: prev.folders.filter(folder => folder.id !== folderId)
                    };
                });
            } catch (error) {
                console.error('Error deleting folder:', error);
                alert(error instanceof Error ? error.message : 'Failed to delete folder');
            }
        }
    };

    if (isLoading) {
        return (
            <Loading size="large" fullScreen={true} />
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/explore"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back</span>
                        </Link>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                        <p className="text-zinc-300">{error || 'User profile not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back button and navigation */}
                <div className="mb-8 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <BsArrowLeft size={20} />
                        <span className="sr-only">Back</span>
                    </button>
                </div>

                {/* Profile header */}
                <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700 rounded-xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Profile image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-full overflow-hidden bg-zinc-700 border-4 border-zinc-600">
                            {profile.image ? (
                                <Image
                                    src={profile.image}
                                    alt={profile.name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BsPersonFill className="w-16 h-16 text-zinc-500" />
                                </div>
                            )}
                        </div>

                        {/* Profile info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{profile.name}</h1>

                            {isOwnProfile && profile.email && (
                                <p className="text-zinc-400 mb-4">{profile.email}</p>
                            )}

                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                                <div className="px-4 py-2 bg-zinc-800 rounded-lg flex items-center">
                                    <BsGlobe className="text-emerald-500 mr-2" />
                                    <span className="text-zinc-300">
                                        {profile.totalNotes} {isOwnProfile ? '' : 'public'} {profile.totalNotes === 1 ? 'note' : 'notes'}
                                    </span>
                                </div>

                                <div className="px-4 py-2 bg-zinc-800 rounded-lg flex items-center">
                                    <BsFolder className="text-yellow-500 mr-2" />
                                    <span className="text-zinc-300">
                                        {profile.totalFolders} {isOwnProfile ? '' : 'public'} {profile.totalFolders === 1 ? 'folder' : 'folders'}
                                    </span>
                                </div>

                                {isOwnProfile && (
                                    <Link
                                        href="/bookmarks"
                                        className="px-4 py-2 bg-zinc-800 rounded-lg flex items-center"
                                    >
                                        <BsBookmarkFill className="text-emerald-500 mr-2" />
                                        <span className="text-zinc-300">Your bookmarks</span>
                                    </Link>
                                )}

                                {isOwnProfile && (
                                    <Link
                                        href="/notes"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                    >
                                        Manage your notes
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Folders section */}
                {profile.folders && profile.folders.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                            <BsFolder className="mr-2 text-yellow-500" />
                            {isOwnProfile
                                ? `Your ${!isOwnProfile ? 'public ' : ''}folders`
                                : `${profile.name}'s public folders`}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.folders.map(folder => (
                                <FolderCard
                                    key={folder.id}
                                    id={folder.id}
                                    name={folder.name}
                                    updatedAt={folder.updatedAt}
                                    isPublic={folder.isPublic}
                                    isOwner={isOwnProfile}
                                    noteCount={folder._count.notes}
                                    subfolderCount={folder._count.subfolders}
                                    onEdit={handleFolderEdit}
                                    onDelete={handleFolderDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes section */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <BsGlobe className="mr-2 text-emerald-500" />
                        {isOwnProfile
                            ? `Your ${!isOwnProfile ? 'public ' : ''}notes`
                            : `${profile.name}'s public notes`}
                    </h2>

                    {profile.notes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.notes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    id={note.id}
                                    title={note.title}
                                    updatedAt={note.updatedAt}
                                    isBookmarked={note.isBookmarked}
                                    isOwner={isOwnProfile}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                            <p className="text-zinc-400">
                                {isOwnProfile
                                    ? "You haven't created any notes yet."
                                    : "This user hasn't published any public notes yet."}
                            </p>

                            {isOwnProfile && (
                                <Link
                                    href="/notes/new"
                                    className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    Create your first note
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}