import { FC, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDotsVertical, BsBookmark, BsBookmarkFill, BsPersonFill, BsPencil } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCardProps } from '@/types';
import Loading from './loading';

export const NoteCard: FC<NoteCardProps> = ({
    id,
    title,
    content,
    updatedAt,
    author,
    isBookmarked = false,
    isOwner = false
}) => {
    const router = useRouter();
    const { status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookmarkState, setIsBookmarkState] = useState(isBookmarked);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    // Extract the first few words for a plain text preview
    const plainTextPreview = content
        ? content
            .replace(/<[^>]*>/g, ' ') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
            .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
            .trim()                   // Trim whitespace
            .slice(0, 120) + (content.length > 120 ? '...' : '')
        : '';

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

    // Function to safely handle profile link clicks
    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);

        // Ensure author and author.id exist before navigating
        if (author && typeof author === 'object' && 'id' in author && author.id) {
            const authorId = String(author.id).trim();
            if (authorId) {
                // Use string concatenation instead of template literals for added safety
                router.push('/profile/' + authorId);
            }
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
            {/* Replace Link with a div and custom handler */}
            <div onClick={handleNoteClick} className="block cursor-pointer">
                <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 overflow-hidden hover:border-zinc-600 transition-all h-full">
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

                        <h3 className="text-lg font-medium text-white truncate mb-2 mt-3 pr-6">{title}</h3>
                        <p className="text-zinc-400 text-sm mb-3 line-clamp-3">
                            {plainTextPreview}
                        </p>

                        {author && (
                            <div className="flex items-center mt-4">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden bg-zinc-700 mr-2">
                                    {author.image ? (
                                        <Image
                                            src={author.image}
                                            alt={author.name || "Author"}
                                            width={24}
                                            height={24}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <BsPersonFill className="text-zinc-500" size={14} />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500 truncate">
                                    {author.name || "Anonymous"} • {timeAgo}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-10 right-2 w-48 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 z-10">
                    <div className="py-1">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            <BsPersonFill className="mr-2" />
                            View Profile
                        </button>
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