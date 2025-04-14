"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BsGlobe, BsArrowRight } from 'react-icons/bs';
import { NoteCard } from '@/components/note-card';
import { Note, RecentPublicNotesProps } from '@/types';
import Loading from './loading';

export function RecentPublicNotes({
    limit = 3,
    showViewAll = true,
    className = ""
}: RecentPublicNotesProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentPublicNotes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/public/notes?limit=${limit}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch public notes');
                }

                const data = await response.json();

                // Convert date strings to Date objects
                const notesWithDates = data.map((note: Note) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt),
                }));

                setNotes(notesWithDates);
            } catch (err) {
                console.error('Error fetching public notes:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentPublicNotes();
    }, [limit]);

    return (
        <section className={className}>
            {/* Improved container with max-width and better padding */}
            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <BsGlobe className="mr-2 text-emerald-500" />
                        Recent Public Notes
                    </h2>

                    {showViewAll && (
                        <Link
                            href="/explore"
                            className="text-emerald-500 hover:text-emerald-400 font-medium flex items-center group"
                        >
                            <span>View All</span>
                            <BsArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loading size="medium" fullScreen={true} />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.length > 0 ? (
                            notes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    id={note.id}
                                    title={note.title}
                                    content={note.content}
                                    createdAt={note.createdAt}
                                    updatedAt={note.updatedAt}
                                    author={note.author}
                                    isPublic={note.isPublic}
                                    isOwner={false}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 p-8 text-center">
                                <p className="text-zinc-400">No public notes available yet.</p>
                                <Link
                                    href="/notes/new"
                                    className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    Create the first note
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}