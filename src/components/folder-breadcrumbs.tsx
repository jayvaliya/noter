import React from 'react';
import Link from 'next/link';
import { BsChevronRight, BsHouseDoor } from 'react-icons/bs';

interface Breadcrumb {
    id: string;
    name: string;
}

interface FolderBreadcrumbsProps {
    breadcrumbs: Breadcrumb[];
    baseRoute: string; // 'notes' or 'explore'
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({ breadcrumbs, baseRoute }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
                <li className="inline-flex items-center">
                    <Link
                        href={`/${baseRoute}`}
                        className="inline-flex items-center text-sm text-zinc-400 hover:text-white"
                    >
                        <BsHouseDoor className="mr-2" />
                        {baseRoute === 'explore' ? 'Explore' : 'My Notes'}
                    </Link>
                </li>

                {breadcrumbs.map((breadcrumb, index) => (
                    <li key={breadcrumb.id} className="flex items-center">
                        <BsChevronRight className="text-zinc-600 mx-1" size={12} />
                        {index === breadcrumbs.length - 1 ? (
                            <span className="text-sm font-medium text-zinc-300 truncate max-w-[150px]">
                                {breadcrumb.name}
                            </span>
                        ) : (
                            <Link
                                href={`/folders/${breadcrumb.id}`}
                                className="text-sm text-zinc-400 hover:text-white truncate max-w-[150px]"
                            >
                                {breadcrumb.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};