import { FC, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { useRouter } from 'next/navigation';

interface NoteCardProps {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export const NoteCard: FC<NoteCardProps> = ({
    id,
    title,
    content,
    updatedAt,
}) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create a preview of the content (first 100 characters)
    const contentPreview = content.length > 100
        ? `${content.substring(0, 100)}...`
        : content;

    // Remove HTML tags for the preview
    const plainTextPreview = contentPreview.replace(/<[^>]*>?/gm, '');

    // Format the date to be more readable
    const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

    // Handle menu toggle
    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the note
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle delete option
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the note
        setIsMenuOpen(false);
        setIsDeleteModalOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete note';

                // Only try to parse JSON if the content type is application/json
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.json();
                        errorMessage = data.message || errorMessage;
                    } catch (parseError) {
                        console.error('Error parsing error response:', parseError);
                    }
                }

                throw new Error(errorMessage);
            }

            // Close the modal first
            setIsDeleteModalOpen(false);

            // Method 1: Force a hard reload of the page
            window.location.href = `/dashboard`;

        } catch (error: any) {
            console.error('Error deleting note:', error);
            // Optional: Add toast notification here
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (

        <div className="relative group">
            <Link href={`/notes/${id}`} className="block">
                <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 overflow-hidden hover:border-zinc-600 transition-all h-full">
                    <div className="p-4">
                        {/* Three-dot menu button */}
                        <div className="absolute top-2 right-2">
                            <button
                                onClick={toggleMenu}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Note options"
                            >
                                <BsThreeDotsVertical />
                            </button>

                            {/* Dropdown menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-1 w-36 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                                    <button
                                        onClick={handleDeleteClick}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-zinc-700 transition-colors"
                                    >
                                        <BsTrash className="mr-2" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-medium text-white truncate mb-2">{title}</h3>
                        <p className="text-zinc-400 text-sm mb-3 line-clamp-3">
                            {plainTextPreview}
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-500">
                                Updated {timeAgo}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-900/75 z-50">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Note</h3>
                        <p className="text-zinc-300 mb-6">
                            Are you sure you want to delete "{title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center"
                                disabled={isDeleting}
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