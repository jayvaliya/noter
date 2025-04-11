import { FC, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDotsVertical, BsBookmark, BsBookmarkFill, BsPencil, BsFileText } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCardProps } from '@/types';
import Loading from './loading';

export const NoteCard: FC<NoteCardProps> = ({
    id,
    title,
    updatedAt,
    isBookmarked = false,
    isOwner = false
}) => {
    const router = useRouter();
    const { status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookmarkState, setIsBookmarkState] = useState(isBookmarked);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    // Format the date - ensure updatedAt is a valid date
    const timeAgo = updatedAt
        ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
        : 'Recently';

    // Handle menu toggle
    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle bookmark click for unauthenticated users
    const handleBookmarkClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);

        // Check if user is authenticated
        if (status !== "authenticated") {
            // Redirect to sign in page
            router.push('/signin');
            return;
        }

        // Ensure id is valid
        if (!id) {
            console.error('Cannot bookmark note with invalid id');
            return;
        }

        // Continue with bookmark functionality for authenticated users
        setIsBookmarkLoading(true);
        try {
            // Always use POST for toggling bookmarks
            const noteId = String(id).trim();
            const response = await fetch('/api/bookmarks/' + noteId, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setIsBookmarkState(data.isBookmarked);
            } else {
                const data = await response.json();
                console.error('Error toggling bookmark:', data.message);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    // Safely navigate to note detail
    const handleNoteClick = (e: React.MouseEvent) => {
        e.preventDefault();

        // Ensure ID is valid
        if (!id) {
            console.error('Cannot navigate to note with invalid id');
            return;
        }

        const noteId = String(id).trim();
        // Use string concatenation instead of template literals
        router.push('/notes/' + noteId);
    };

    return (
        <div className="relative group">
            <div onClick={handleNoteClick} className="block cursor-pointer">
                <div className="bg-zinc-900 backdrop-blur-sm rounded-lg border border-zinc-700 overflow-hidden hover:border-emerald-500 transition-all h-full">
                    <div className="p-4">
                        {/* Three-dot menu button */}
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={toggleMenu}
                                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                aria-label="Note options"
                            >
                                <BsThreeDotsVertical size={16} />
                            </button>
                        </div>

                        {/* Note icon */}
                        <div className="flex items-center mb-3">
                            <div className="mr-3 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                <BsFileText size={18} />
                            </div>
                            <h3 className="text-lg font-medium text-white truncate pr-6">{title}</h3>
                        </div>

                        {/* Timestamp only */}
                        <div className="mt-4 text-xs text-zinc-500">
                            {timeAgo}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-10 right-2 w-48 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 z-10">
                    <div className="py-1">
                        <button
                            onClick={handleBookmarkClick}
                            disabled={isBookmarkLoading}
                            className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            {isBookmarkLoading ? (
                                <Loading size="small" />
                            ) : isBookmarkState ? (
                                <BsBookmarkFill className="mr-2 text-emerald-500" />
                            ) : (
                                <BsBookmark className="mr-2" />
                            )}
                            {isBookmarkState ? "Unbookmark" : "Bookmark"}
                        </button>
                        {isOwner && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    router.push(`/notes/${id}/edit`);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                                <BsPencil className="mr-2" />
                                Edit Note
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};