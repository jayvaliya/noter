"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BsSave, BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { TipTapEditor } from '@/components/tiptap-editor';
import Loading from '@/components/loading';

// Define API response interfaces
interface ApiNote {
    id: string;
    title: string;
    content: string;
    isPublic: boolean;
    authorId: string;
}

interface ApiErrorResponse {
    message: string;
}

export default function EditNote({ params }: { params: { id: string } }) {
    const { status, data: session } = useSession();
    const router = useRouter();
    const noteId = params.id;

    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [originalNote, setOriginalNote] = useState<ApiNote | null>(null);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Fetch the note data when the component mounts
    useEffect(() => {
        const fetchNote = async () => {
            if (status === "unauthenticated") {
                router.push('/signin');
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/notes/${noteId}`);

                if (!response.ok) {
                    const errorData = await response.json() as ApiErrorResponse;
                    throw new Error(errorData.message || 'Failed to fetch note');
                }

                const noteData = await response.json() as ApiNote;

                // Check if user is the author
                if (session?.user?.id !== noteData.authorId) {
                    throw new Error("You don't have permission to edit this note");
                }

                // Set form state with note data
                setTitle(noteData.title);
                setContent(noteData.content);
                setIsPublic(noteData.isPublic);
                setOriginalNote(noteData);
            } catch (err) {
                console.error('Error fetching note:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (status !== "loading") {
            fetchNote();
        }
    }, [noteId, router, status, session]);

    // Handle saving the updated note
    const handleSave = async () => {
        if (!title.trim()) {
            setError('Please enter a title for your note');
            return;
        }

        if (!content.trim() || content === '<p></p>') {
            setError('Please add some content to your note');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    isPublic,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json() as ApiErrorResponse;
                throw new Error(errorData.message || 'Failed to update note');
            }

            // Navigate back to the note view
            router.push(`/notes/${noteId}`);
        } catch (err) {
            console.error('Error updating note:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state
    if (status === "loading" || isLoading) {
        return <Loading size="large" fullScreen={true} />;
    }

    // Show error
    if (error && !originalNote) {
        return (
            <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link
                            href="/notes"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to notes</span>
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

    // Update the container styling to give the editor proper boundaries
    return (
        <div className="min-h-screen pb-20 bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header with back button */}
                <div
                    className="mb-8 flex items-center justify-between sticky top-0 z-40 bg-zinc-950 py-2"
                    data-navbar="true"
                >
                    <div className="flex items-center">
                        <Link
                            href={`/notes/${noteId}`}
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to note</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Edit Note</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loading size="small" color="white" />
                        ) : (
                            <>
                                <BsSave />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Error message */}
                {error && originalNote && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Title input */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note Title"
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-white text-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Public/Private toggle */}
                <div className="flex items-center mt-4 mb-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-3 text-sm font-medium text-zinc-300">
                            {isPublic ? 'Public' : 'Private'}
                        </span>
                    </label>
                    <span className="ml-2 text-xs text-zinc-500">
                        {isPublic ? 'Anyone can learn from this note' : 'Only you can view this note'}
                    </span>
                </div>

                {/* TipTap Editor with container that has a specific height constraint */}
                <div className="mb-20">
                    <TipTapEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Start writing your note..."
                    />
                </div>
            </div>
        </div>
    );
}