"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BsSave, BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { TipTapEditor } from '@/components/tiptap-editor';

export default function NewNote() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

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
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save note');
            }

            // Navigate to the dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header with back button */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href="/dashboard"
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
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Saving...</span>
                            </>
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