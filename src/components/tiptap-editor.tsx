"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useState } from 'react';
import {
    BsTypeBold, BsTypeItalic, BsTypeStrikethrough,
    BsCode, BsListOl, BsListUl, BsLink45Deg,
    BsArrowCounterclockwise, BsArrowClockwise,
    BsTextLeft, BsTextCenter, BsTextRight, BsTextParagraph,
    BsHighlights, BsThreeDotsVertical,
} from 'react-icons/bs';
import { PiHighlighterFill } from 'react-icons/pi';
import { FaQuoteLeft } from 'react-icons/fa';
import { HiOutlineCode } from 'react-icons/hi';
import { HiOutlineCodeBracket } from 'react-icons/hi2';

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const TipTapEditor = ({ value, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) => {
    const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showFontOptions, setShowFontOptions] = useState(false);

    // Define available fonts
    const fontOptions = [
        { name: 'Default', value: 'var(--font-inter)' },
        { name: 'Sans Serif', value: 'Inter, sans-serif' },
        { name: 'Serif', value: 'Georgia, serif' },
        { name: 'Monospace', value: 'var(--font-geist-mono), monospace' },
    ];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-zinc-900 rounded-md p-2 font-mono text-sm my-4',
                    },
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-emerald-500 underline hover:text-emerald-600',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
            }),
            Typography,
            Highlight.configure({
                HTMLAttributes: {
                    class: 'bg-yellow-200/20 rounded px-1 text-white',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || `<p></p>`,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-64 p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        if (linkUrl) {
            // Check if URL is valid
            try {
                const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
                new URL(url);

                editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .setLink({ href: url })
                    .run();

                setIsLinkInputVisible(false);
                setLinkUrl('');
            } catch (e) {
                alert('Please enter a valid URL');
            }
        } else {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkInputVisible(false);
        }
    };

    const toggleHeading = (level: 1 | 2 | 3) => {
        editor.chain().focus().toggleHeading({ level }).run();
    };

    const setFontFamily = (fontFamily: string) => {
        // This would require a custom extension, but we can apply inline styles
        editor.chain().focus().setMark('textStyle', { fontFamily }).run();
        setShowFontOptions(false);
    };

    // Keyboard shortcuts information
    const keyboardShortcuts = [
        { key: 'Ctrl+B', description: 'Bold' },
        { key: 'Ctrl+I', description: 'Italic' },
        { key: 'Ctrl+E', description: 'Center align' },
        { key: 'Ctrl+Shift+L', description: 'Left align' },
        { key: 'Ctrl+Shift+R', description: 'Right align' },
        { key: 'Ctrl+Shift+7', description: 'Ordered list' },
        { key: 'Ctrl+Shift+8', description: 'Bullet list' },
        { key: 'Ctrl+Shift+9', description: 'Blockquote' },
        { key: 'Ctrl+K', description: 'Create link' },
        { key: 'Ctrl+Z', description: 'Undo' },
        { key: 'Ctrl+Y', description: 'Redo' },
    ];

    return (
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-zinc-800 border-b border-zinc-700 p-2 flex flex-wrap gap-1">
                {/* Font Family */}
                <div className="relative mr-2">
                    <button
                        onClick={() => setShowFontOptions(!showFontOptions)}
                        className="p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center gap-1"
                        title="Font Family"
                    >
                        <BsTextParagraph />
                        <span className="text-xs hidden sm:inline">Font</span>
                        <BsThreeDotsVertical className="ml-1 text-xs" />
                    </button>

                    {showFontOptions && (
                        <div className="absolute z-10 top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg">
                            {fontOptions.map((font) => (
                                <button
                                    key={font.value}
                                    onClick={() => setFontFamily(font.value)}
                                    className="block w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-700"
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Bold (Ctrl+B)"
                >
                    <BsTypeBold />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Italic (Ctrl+I)"
                >
                    <BsTypeItalic />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('strike') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Strikethrough"
                >
                    <BsTypeStrikethrough />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('highlight') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Highlight"
                >
                    <PiHighlighterFill />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('codeBlock') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Code Block"
                >
                    <HiOutlineCodeBracket />
                </button>

                <div className="w-px h-6 mx-1 bg-zinc-700 self-center"></div>

                {/* Text alignment */}
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Align Left (Ctrl+Shift+L)"
                >
                    <BsTextLeft />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Align Center (Ctrl+E)"
                >
                    <BsTextCenter />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Align Right (Ctrl+Shift+R)"
                >
                    <BsTextRight />
                </button>

                <div className="w-px h-6 mx-1 bg-zinc-700 self-center"></div>

                <button
                    onClick={() => toggleHeading(1)}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Heading 1"
                >
                    <span className="font-bold">H1</span>
                </button>
                <button
                    onClick={() => toggleHeading(2)}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Heading 2"
                >
                    <span className="font-bold">H2</span>
                </button>
                <button
                    onClick={() => toggleHeading(3)}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-700 text-white' : ''}`}
                    title="Heading 3"
                >
                    <span className="font-bold">H3</span>
                </button>

                <div className="w-px h-6 mx-1 bg-zinc-700 self-center"></div>

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Bullet List (Ctrl+Shift+8)"
                >
                    <BsListUl />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Ordered List (Ctrl+Shift+7)"
                >
                    <BsListOl />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('blockquote') ? 'bg-zinc-700 text-white' : ''}`}
                    title="Quote (Ctrl+Shift+9)"
                >
                    <FaQuoteLeft />
                </button>

                <div className="w-px h-6 mx-1 bg-zinc-700 self-center"></div>

                {isLinkInputVisible ? (
                    <div className="flex items-center bg-zinc-700 rounded overflow-hidden">
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Enter URL"
                            className="bg-transparent text-white px-2 py-1 focus:outline-none text-sm w-40"
                            autoFocus
                        />
                        <button
                            onClick={setLink}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 text-sm"
                        >
                            Set
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href;
                            setLinkUrl(previousUrl || '');
                            setIsLinkInputVisible(true);
                        }}
                        className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 ${editor.isActive('link') ? 'bg-zinc-700 text-white' : ''}`}
                        title="Link (Ctrl+K)"
                    >
                        <BsLink45Deg />
                    </button>
                )}

                <div className="w-px h-6 mx-1 bg-zinc-700 self-center"></div>

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                >
                    <BsArrowCounterclockwise />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo (Ctrl+Y)"
                >
                    <BsArrowClockwise />
                </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="bg-zinc-900/50 py-1 px-2 text-xs text-zinc-500 hidden sm:block">
                <span>Tip: Use keyboard shortcuts like Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links</span>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />

            {/* Enhanced Bubble menu for highlighted text */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="bg-zinc-800 shadow-xl rounded overflow-hidden flex"
                >
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 text-sm ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <BsTypeBold />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 text-sm ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <BsTypeItalic />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={`p-2 text-sm ${editor.isActive('highlight') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <BsHighlights />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-2 text-sm ${editor.isActive('strike') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <BsTypeStrikethrough />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 text-sm ${editor.isActive('code') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <HiOutlineCodeBracket />
                    </button>
                    <button
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href;
                            setLinkUrl(previousUrl || '');
                            setIsLinkInputVisible(true);
                        }}
                        className={`p-2 text-sm ${editor.isActive('link') ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                    >
                        <BsLink45Deg />
                    </button>
                </BubbleMenu>
            )}
        </div>
    );
};