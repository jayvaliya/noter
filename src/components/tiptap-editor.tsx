"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useState, useRef } from 'react';
import {
    BsTypeBold, BsTypeItalic, BsTypeStrikethrough,
    BsListOl, BsListUl, BsLink45Deg,
    BsArrowCounterclockwise, BsArrowClockwise,
    BsTextLeft, BsTextCenter, BsTextRight,
    BsFileEarmarkCode,
} from 'react-icons/bs';
import { TbCodeVariable } from "react-icons/tb";
import { PiHighlighterFill } from 'react-icons/pi';
import { FaQuoteLeft } from 'react-icons/fa';
import { HiOutlineCodeBracket } from 'react-icons/hi2';
import { TipTapEditorProps, FontOption } from '@/types';

export const TipTapEditor = ({ value, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) => {
    const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showFontOptions, setShowFontOptions] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Define available fonts
    const fontOptions: FontOption[] = [
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
            try {
                const url = linkUrl.startsWith('http') ? linkUrl : "https://" + linkUrl;
                new URL(url);

                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                setIsLinkInputVisible(false);
                setLinkUrl('');
            } catch {
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
        editor.chain().focus().setMark('textStyle', { fontFamily }).run();
        setShowFontOptions(false);
    };

    return (
        <div className="relative">
            {/* Main editor content */}
            <div ref={containerRef} className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden">
                <EditorContent editor={editor} className="prose prose-invert max-w-none focus:outline-none min-h-64 p-4" />
            </div>

            {/* Left-side fixed toolbar - MADE LARGER */}
            <div
                ref={toolbarRef}
                className="fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-700 rounded-lg p-3 z-30 shadow-lg"
                style={{ width: '110px' }} // Increased width
            >
                {/* Grid layout for two columns */}
                <div className="grid grid-cols-2 gap-2"> {/* Increased gap */}
                    {/* First column - Formatting options */}
                    <div className="flex flex-col gap-2"> {/* Increased gap */}
                        {/* Font Family */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFontOptions(!showFontOptions)}
                                className="p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center w-full"
                                title="Font Family"
                            >
                                <span className="text-sm font-medium">Aa</span> {/* Increased font size */}
                            </button>

                            {showFontOptions && (
                                <div className="absolute z-10 right-full mr-2 top-0 bg-zinc-800 border border-zinc-700 rounded shadow-lg">
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
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Bold (Ctrl+B)"
                        >
                            <BsTypeBold className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Italic (Ctrl+I)"
                        >
                            <BsTypeItalic className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHighlight().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('highlight') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Highlight"
                        >
                            <PiHighlighterFill className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('codeBlock') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Code Block"
                        >
                            <BsFileEarmarkCode className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('code') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Inline Code"
                        >
                            <TbCodeVariable className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Align Left"
                        >
                            <BsTextLeft className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Align Center"
                        >
                            <BsTextCenter className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Align Right"
                        >
                            <BsTextRight className="w-5 h-5" /> {/* Increased icon size */}
                        </button>
                    </div>

                    {/* Second column - Headings, Lists and more */}
                    <div className="flex flex-col gap-2"> {/* Increased gap */}
                        <button
                            onClick={() => toggleHeading(1)}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Heading 1"
                        >
                            <span className="text-sm font-bold">H1</span> {/* Increased font size */}
                        </button>

                        <button
                            onClick={() => toggleHeading(2)}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Heading 2"
                        >
                            <span className="text-sm font-bold">H2</span> {/* Increased font size */}
                        </button>

                        <button
                            onClick={() => toggleHeading(3)}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-700 text-white' : ''}`}
                            title="Heading 3"
                        >
                            <span className="text-sm font-bold">H3</span> {/* Increased font size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Bullet List"
                        >
                            <BsListUl className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Ordered List"
                        >
                            <BsListOl className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('blockquote') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Quote"
                        >
                            <FaQuoteLeft className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => {
                                const previousUrl = editor.getAttributes('link').href;
                                setLinkUrl(previousUrl || '');
                                setIsLinkInputVisible(true);
                            }}
                            className={`p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center ${editor.isActive('link') ? 'bg-zinc-700 text-white' : ''}`}
                            title="Link"
                        >
                            <BsLink45Deg className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <BsArrowCounterclockwise className="w-5 h-5" /> {/* Increased icon size */}
                        </button>

                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="p-2 rounded hover:bg-zinc-700 text-zinc-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <BsArrowClockwise className="w-5 h-5" /> {/* Increased icon size */}
                        </button>
                    </div>
                </div>
            </div>

            {/* Link input popup */}
            {isLinkInputVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-4 max-w-sm w-full">
                        <h3 className="text-white text-lg mb-4">Insert Link</h3>
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Enter URL"
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsLinkInputVisible(false)}
                                className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={setLink}
                                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Bubble menu for highlighted text */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="bg-zinc-800 shadow-xl rounded overflow-hidden flex z-50"
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
                        <TbCodeVariable />
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