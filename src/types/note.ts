import { User } from "./user";

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isBookmarked?: boolean;
    isPublic: boolean;
    authorId: string;
    author?: User;
}

export interface NoteCardProps {
    id: string;
    title: string;
    updatedAt: Date;
    isBookmarked?: boolean;
    isOwner?: boolean;
}

export interface BookmarkedNote {
    id: string;
    noteId: string;
    userId: string;
    createdAt: Date;
    note: Note;
}