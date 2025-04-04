export interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface FontOption {
    name: string;
    value: string;
}