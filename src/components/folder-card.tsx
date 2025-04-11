import { FC, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDotsVertical, BsFolderFill, BsFileText, BsPencil, BsTrash } from 'react-icons/bs';
import { useRouter } from 'next/navigation';

interface FolderCardProps {
    id: string;
    name: string;
    updatedAt: Date;
    isPublic: boolean;
    isOwner: boolean;
    noteCount: number;
    subfolderCount: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const FolderCard: FC<FolderCardProps> = ({
    id,
    name,
    updatedAt,
    isPublic,
    isOwner,
    noteCount,
    subfolderCount,
    onEdit,
    onDelete
}) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Format the date
    const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

    // Handle menu toggle
    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    // Navigate to folder
    const handleFolderClick = () => {
        router.push(`/notes/folders/${id}`);
    };

    return (
        <div className="relative group">
            <div onClick={handleFolderClick} className="block cursor-pointer">
                <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700 overflow-hidden hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-yellow-500/20 hover:border-yellow-500/50 transition-all h-full">
                    <div className="p-4">
                        {/* Three-dot menu button */}
                        {isOwner && (
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={toggleMenu}
                                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                    aria-label="Folder options"
                                >
                                    <BsThreeDotsVertical size={16} />
                                </button>
                            </div>
                        )}

                        {/* Folder icon and name */}
                        <div className="flex items-center mb-3">
                            <div className="mr-3 p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                                <BsFolderFill size={18} />
                            </div>
                            <h3 className="text-lg font-medium text-white truncate pr-6">{name}</h3>
                        </div>

                        {/* Folder stats */}
                        <div className="flex items-center text-xs text-zinc-400 space-x-3 mt-3">
                            <div className="flex items-center">
                                <BsFolderFill className="mr-1 text-zinc-500" size={12} />
                                <span>{subfolderCount}</span>
                            </div>
                            <div className="flex items-center">
                                <BsFileText className="mr-1 text-zinc-500" size={12} />
                                <span>{noteCount}</span>
                            </div>
                        </div>

                        {/* Privacy indicator and timestamp */}
                        <div className="flex items-center justify-between mt-4 text-xs">
                            <span className={`px-2 py-1 rounded-full ${isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                {isPublic ? 'Public' : 'Private'}
                            </span>
                            <span className="text-zinc-500">{timeAgo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-10 right-2 w-48 bg-zinc-800 shadow-lg rounded-md border border-zinc-700 z-10">
                    <div className="py-1">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onEdit(id);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            <BsPencil className="mr-2" />
                            Edit Folder
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onDelete(id);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-zinc-700 transition-colors text-red-400 hover:text-red-300"
                        >
                            <BsTrash className="mr-2" />
                            Delete Folder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};