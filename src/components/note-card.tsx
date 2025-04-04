import { FC, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDotsVertical, BsTrash, BsBookmark, BsBookmarkFill, BsGlobe, BsLock, BsPersonFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NoteCardProps } from '@/types';

export const NoteCard: FC<NoteCardProps> = ({
    id,
    title,
    content,
    updatedAt,
    author,
    isBookmarked = false,
    isPublic = true,
    isOwner = true,
}) => {
    const router = useRouter();
    const { status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBookmarkState, setIsBookmarkState] = useState(isBookmarked);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [isPublicState, setIsPublicState] = useState(isPublic);
    const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);

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

    // Handle delete option
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsDeleteModalOpen(true);
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
            const method = isBookmarkState ? 'DELETE' : 'POST';
            const noteId = String(id).trim();
            // Use string concatenation instead of template literals for added safety
            const response = await fetch('/api/bookmarks/' + noteId, {
                method: method,
            });

            if (response.ok) {
                setIsBookmarkState(!isBookmarkState);
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

    // Handle privacy toggle
    const handlePrivacyToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isOwner) return;
        setIsMenuOpen(false);
        setIsPrivacyLoading(true);

        // Ensure id is valid
        if (!id) {
            console.error('Cannot update privacy for note with invalid id');
            setIsPrivacyLoading(false);
            return;
        }

        try {
            const noteId = String(id).trim();
            // Use string concatenation instead of template literals for added safety
            const response = await fetch('/api/notes/' + noteId, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isPublic: !isPublicState,
                }),
            });

            if (response.ok) {
                setIsPublicState(!isPublicState);
            } else {
                const data = await response.json();
                console.error('Error toggling note privacy:', data.message);
            }
        } catch (error) {
            console.error('Error toggling note privacy:', error);
        } finally {
            setIsPrivacyLoading(false);
        }
    };

    // Handle actual delete operation
    const handleDeleteConfirm = async () => {
        // Ensure id is valid
        if (!id) {
            console.error('Cannot delete note with invalid id');
            setIsDeleteModalOpen(false);
            return;
        }

        setIsDeleting(true);
        try {
            const noteId = String(id).trim();
            // Use string concatenation instead of template literals for added safety
            const response = await fetch('/api/notes/' + noteId, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Use static strings and separate parameters instead of template literals
                const timestamp = Date.now().toString();
                const redirectUrl = '/notes?t=' + timestamp;
                window.location.href = redirectUrl;
            } else {
                const data = await response.json();
                console.error('Error deleting note:', data.message);
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    // Function to safely handle profile link clicks
    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
                        {/* Bookmark indicator icon */}
                        {isBookmarkState && (
                            <div className="absolute top-3 left-4">
                                <BsBookmarkFill className="text-emerald-500" size={14} />
                            </div>
                        )}

                        {/* Privacy indicator */}
                        <div className="absolute top-2 right-8">
                            {isPublicState ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                                    Public
                                </span>
                            ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-700">
                                    Private
                                </span>
                            )}
                        </div>

                        {/* Three-dot menu button */}
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={toggleMenu}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                <BsThreeDotsVertical size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-medium text-white truncate mb-2 mt-3 pr-6">{title}</h3>
                        <p className="text-zinc-400 text-sm mb-3 line-clamp-3">
                            {plainTextPreview}
                        </p>

                        {/* Add author information */}
                        {author && (
                            <div className="flex items-center mb-3">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700 mr-1.5 flex-shrink-0">
                                    {author.image ? (
                                        <Image
                                            src={author.image}
                                            alt={author.name || "Author"}
                                            width={20}
                                            height={20}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BsPersonFill className="w-3 h-3 text-zinc-400" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-400 truncate">
                                    {author.name || "Unknown author"}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-500">
                                Updated {timeAgo}
                            </span>

                            {/* Fixed author profile link */}
                            {author && typeof author === 'object' && 'id' in author && author.id ? (
                                <button
                                    onClick={handleProfileClick}
                                    className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                                >
                                    View profile
                                </button>
                            ) : null}
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
                                <div className="animate-spin h-3 w-3 border-2 border-zinc-300 border-t-transparent rounded-full mr-2"></div>
                            ) : isBookmarkState ? (
                                <BsBookmarkFill className="mr-2 text-emerald-500" />
                            ) : (
                                <BsBookmark className="mr-2" />
                            )}
                            {isBookmarkState ? "Unbookmark" : "Bookmark"}
                        </button>
                        {isOwner && (
                            <button
                                onClick={handlePrivacyToggle}
                                disabled={isPrivacyLoading}
                                className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                                {isPrivacyLoading ? (
                                    <div className="animate-spin h-3 w-3 border-2 border-zinc-300 border-t-transparent rounded-full mr-2"></div>
                                ) : isPublicState ? (
                                    <BsGlobe className="mr-2" />
                                ) : (
                                    <BsLock className="mr-2" />
                                )}
                                {isPublicState ? "Make Private" : "Make Public"}
                            </button>
                        )}
                        <button
                            onClick={handleDeleteClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                        >
                            <BsTrash className="mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
                        <p className="text-zinc-300 mb-6">
                            Are you sure you want to delete this note? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};