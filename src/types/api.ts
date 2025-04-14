export interface UserContentResponse {
    notes: {
        items: ApiNote[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    folders: {
        items: ApiFolder[];
        total: number;
    };
    bookmarks?: {
        items: ApiNote[];
        total: number;
    };
}

export interface ApiNote {
    id: string;
    title: string;
    updatedAt: string;
    createdAt: string;
    isPublic: boolean;
    authorId: string;
    folderId?: string | null;
    isBookmarked?: boolean;
    author: {
        name: string | null;
        image: string | null;
    };
}

export interface ApiFolder {
    id: string;
    name: string;
    updatedAt: string;
    createdAt: string;
    isPublic: boolean;
    authorId: string;
    parentId: string | null;
    _count: {
        notes: number;
        subfolders: number;
    };
}