import { Note } from "./note";

export interface User {
    id: string;
    name: string | null;
    image: string | null;
    email?: string | null;
}

export interface UserProfile {
    id: string;
    name: string;
    image: string | null;
    email?: string;
    totalPublicNotes: number;
    notes: Array<Note>;
}