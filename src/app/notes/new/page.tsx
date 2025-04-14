"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BsSave, BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { TipTapEditor } from '@/components/tiptap-editor';
import Loading from '@/components/loading';

export default function NewNote() {
    const { status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);

    // Check if user is authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/signin');
        }
    }, [status, router]);

    // Handle saving the note
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
            // Get folderId from URL if present
            const searchParams = new URLSearchParams(window.location.search);
            const folderId = searchParams.get('folderId');

            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    isPublic,
                    folderId: folderId || null
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save note');
            }

            // Redirect either to the folder or to the notes page
            if (folderId) {
                router.push(`/folders/${folderId}`);
            } else {
                router.push('/notes');
            }
        } catch (err) {
            console.error('Error saving note:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <Loading size="large" fullScreen={true} />
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header with back button */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href="/notes"
                            className="text-zinc-400 hover:text-white mr-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <BsArrowLeft size={20} />
                            <span className="sr-only">Back to dashboard</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Create New Note</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loading size="small" />
                        ) : (
                            <>
                                <BsSave />
                                <span>Save Note</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Error message */}
                {error && (
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
                    <span className="ml-2 text-xs text-zinc-500">
                        {"( We recommend keeping your notes public so others can benefit from them.)"}
                    </span>
                </div>

                {/* TipTap Editor */}
                <TipTapEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Start writing your note..."
                />
            </div>
        </div>
    );
}