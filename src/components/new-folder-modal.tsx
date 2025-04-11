import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BsFolderPlus, BsX } from 'react-icons/bs';

interface NewFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, isPublic: boolean) => Promise<void>;
    currentFolderId?: string;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    currentFolderId
}) => {
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter a folder name');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit(name.trim(), isPublic);
            setName('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create folder');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-white flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <BsFolderPlus className="mr-2 text-yellow-400" />
                                        {currentFolderId ? 'Create Subfolder' : 'Create New Folder'}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
                                    >
                                        <BsX size={20} />
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="mt-4">
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label htmlFor="folderName" className="block text-sm font-medium text-zinc-300 mb-2">
                                            Folder Name
                                        </label>
                                        <input
                                            type="text"
                                            id="folderName"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            placeholder="My Folder"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isPublic}
                                                    onChange={() => setIsPublic(!isPublic)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                                <span className="ml-3 text-sm font-medium text-zinc-300">
                                                    {isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </label>
                                            <span className="ml-2 text-xs text-zinc-500">
                                                {isPublic ? 'Anyone can view this folder' : 'Only you can view this folder'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create Folder'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};