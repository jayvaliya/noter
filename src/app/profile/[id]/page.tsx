"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BsPersonFill, BsBookmarkFill, BsArrowLeft, BsGlobe } from 'react-icons/bs';
import { NoteCard } from '@/components/note-card';
import { Note } from '@/types';
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
}

// API error response type
interface ApiError {
    message: string;
}

// API response for user profile
interface ApiUserProfile {
    id: string;
    name: string;
    image: string | null;
    email?: string;
    totalPublicNotes: number;
    notes: ApiNote[];
}

// Processed user profile with Date objects
interface UserProfile {
    id: string;
    name: string;
    image: string | null;
    email?: string;
    totalPublicNotes: number;
    notes: Note[];
}

export default function ProfilePage() {
    const params = useParams();
    const userId = params?.id as string;
    const router = useRouter();
    const { data: session } = useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const isOwnProfile = session?.user?.id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);

            try {
                const response = await fetch("/api/users/" + userId);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('User not found');
                    }
                    const errorData = await response.json() as ApiError;
                    throw new Error(errorData.message || 'Failed to load profile');
                }

                const data = await response.json() as ApiUserProfile;

                // Convert dates and add a flag for the note cards
                const profileData: UserProfile = {
                    ...data,
                    notes: data.notes.map((note: ApiNote) => ({
                        ...note,
                        createdAt: new Date(note.createdAt),
                        updatedAt: new Date(note.updatedAt),
                    })),
                };

                setProfile(profileData);
            } catch (err) {
                console.error('Error loading profile:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const loadMoreNotes = async () => {
        if (!profile || loadingMore) return;

        setLoadingMore(true);

        try {
            // Skip the notes we already have
            const response = await fetch('/api/users/' + userId + '/notes?skip=' + profile.notes.length);

            if (!response.ok) {
                throw new Error('Failed to load more notes');
            }

            const data = await response.json() as ApiNote[];

            if (data.length === 0) {
                // No more notes to load
                return;
            }

            // Convert dates
            const newNotes: Note[] = data.map((note: ApiNote) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: new Date(note.updatedAt),
            }));

            setProfile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    notes: [...prev.notes, ...newNotes],
                };
            });
        } catch (err) {
            console.error('Error loading more notes:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    if (isLoading) {
        return (
            <Loading size="large" fullScreen={true} />
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
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
                                        {profile.totalPublicNotes} public {profile.totalPublicNotes === 1 ? 'note' : 'notes'}
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

                {/* Public notes section */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <BsGlobe className="mr-2 text-emerald-500" />
                        {isOwnProfile ? 'Your public notes' : 'Public notes by this user'}
                    </h2>

                    {profile.notes.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profile.notes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        id={note.id}
                                        title={note.title}
                                        content={note.content}
                                        createdAt={note.createdAt}
                                        updatedAt={note.updatedAt}
                                        author={{
                                            id: profile.id,
                                            name: profile.name,
                                            image: profile.image
                                        }}
                                        isPublic={note.isPublic}
                                        isOwner={isOwnProfile}
                                    />
                                ))}
                            </div>

                            {profile.totalPublicNotes > profile.notes.length && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={loadMoreNotes}
                                        disabled={loadingMore}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <div className="flex gap-1.5 items-center justify-center">
                                                <Loading size="small" />
                                                Loading more...
                                            </div>
                                        ) : (
                                            'Load more notes'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                            <p className="text-zinc-400">
                                {isOwnProfile
                                    ? "You haven't published any public notes yet."
                                    : "This user hasn't published any public notes yet."}
                            </p>

                            {isOwnProfile && (
                                <Link
                                    href="/notes/new"
                                    className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    Create your first public note
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}