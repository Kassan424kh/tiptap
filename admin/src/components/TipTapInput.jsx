import {EditorContent, Mark, mergeAttributes, useEditor, useEditorState} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import {useTheme} from 'styled-components';
import {CodeBlockLowlight} from '@tiptap/extension-code-block-lowlight';
import {common, createLowlight} from 'lowlight'
import {MaterialSymbol} from "react-material-symbols";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { prefixFileUrlWithBackendUrl } from '@strapi/helper-plugin';
import { useStrapiApp } from '@strapi/strapi/admin';
import { useLibrary } from '@strapi/helper-plugin';

import 'react-material-symbols/outlined';
import {useEffect, useState} from "react";
import {EditorWrapper, Toolbar, Button} from "./styles";

const lowlight = createLowlight(common)

const Tiptap = ({
                    name,
                    error,
                    description,
                    onChange,
                    value,
                    intlLabel,
                    attribute,
                }) => {

    const [isOpen, setIsOpen] = useState(false);
    const { components } = useLibrary();
    const MediaLibraryDialog = components?.['media-library'];

    console.log("components", components);
    console.log("MediaLibraryDialog", MediaLibraryDialog);

    const handleSelect = (files) => {
        const formatted = files.map(file => ({
            id: file.id,
            url: prefixFileUrlWithBackendUrl(file.url),
            alt: file.alternativeText || file.name,
            mime: file.mime,
        }));
        if (formatted.length > 0)
            formatted.forEach(file => editor.chain().focus().setImage({ src: prefixFileUrlWithBackendUrl(file.url) }).run());

        setIsOpen(false);
    };

    const theme = useTheme();

    const [editorValue, setEditorValue] = useState(value || '<p></p>');

    useEffect(() => {
        onChange({
            target:
                {
                    name,
                    value: editorValue,
                    type: attribute.type
                }
        })
    }, [editorValue]);

    const [showImageModal, setShowImageModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Disable default heading in StarterKit
                codeBlock: false, // Disable default codeBlock
                code: false,
            }),
            Heading.configure({levels: [1, 2, 3, 4, 5, 6]}),
            Underline,
            Strike,
            Code,
            CodeBlockLowlight.configure({
                languageClassPrefix: 'language-',
                defaultLanguage: 'javascript',
                lowlight,
            }),
            TaskList,
            TaskItem,
            TextAlign.configure({types: ['heading', 'paragraph']}),
            Image.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        width: {
                            default: 'auto',
                            parseHTML: element => element.getAttribute('width') || element.style.width || 'auto',
                            renderHTML: attributes => {
                                return {
                                    width: attributes.width,
                                    style: `width: ${attributes.width};`,
                                }
                            },
                        },
                    }
                },
            }).configure({ selectable: true }), // Add image extension
        ],
        content: editorValue,
        onUpdate: ({editor}) => {
            setEditorValue(editor.getHTML())
        },
    });

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx.editor.isActive('bold'),
                canBold: ctx.editor.can().chain().focus().toggleBold().run(),
                isItalic: ctx.editor.isActive('italic'),
                canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
                isStrike: ctx.editor.isActive('strike'),
                canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
                isCode: ctx.editor.isActive('code'),
                canCode: ctx.editor.can().chain().focus().toggleCode().run(),
                canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
                isParagraph: ctx.editor.isActive('paragraph'),
                isHeading1: ctx.editor.isActive('heading', {level: 1}),
                isHeading2: ctx.editor.isActive('heading', {level: 2}),
                isHeading3: ctx.editor.isActive('heading', {level: 3}),
                isHeading4: ctx.editor.isActive('heading', {level: 4}),
                isHeading5: ctx.editor.isActive('heading', {level: 5}),
                isHeading6: ctx.editor.isActive('heading', {level: 6}),
                isBulletList: ctx.editor.isActive('bulletList'),
                isOrderedList: ctx.editor.isActive('orderedList'),
                isCodeBlock: ctx.editor.isActive('codeBlock'),
                isBlockquote: ctx.editor.isActive('blockquote'),
                isTaskList: ctx.editor.isActive('taskList'),
                isTextAlignLeft: ctx.editor.isActive({textAlign: 'left'}),
                canUndo: ctx.editor.can().chain().focus().undo().run(),
                canRedo: ctx.editor.can().chain().focus().redo().run(),
            }
        },
    });

    const headingOptions = [
        {level: 0, label: 'Normal'},
        {level: 1, label: 'Title 1'},
        {level: 2, label: 'Title 2'},
        {level: 3, label: 'Title 3'},
        {level: 4, label: 'Title 4'},
        {level: 5, label: 'Title 5'},
        {level: 6, label: 'Title 6'},
    ];

    const [align, setAlign] = useState('left');
    useEffect(() => {
        if (editor) {
            if (editor.isActive({textAlign: 'right'})) setAlign('right');
            else if (editor.isActive({textAlign: 'justify'})) setAlign('justify');
            else if (editor.isActive({textAlign: 'center'})) setAlign('center');
            else setAlign('left');
        }
    }, [editor && editor.state.selection]);

    const toolbarGroups = [
        [
            {
                type: 'select',
                value: () => align,
                onChange: (e) => {
                    const alignValue = e.target.value;
                    setAlign(alignValue);
                    editor.chain().focus().setTextAlign(alignValue).run();
                },
                options: [
                    {value: 'left', label: 'Left'},
                    {value: 'center', label: 'Center'},
                    {value: 'right', label: 'Right'},
                    {value: 'justify', label: 'Justify'},
                ],
                icon: 'format_align_left',
            },
        ],
        [
            {
                command: () => editor.chain().focus().toggleBold().run(),
                icon: 'format_bold',
                isActive: (state) => state.isBold,
                canUse: (state) => state.canBold
            },
            {
                command: () => editor.chain().focus().toggleItalic().run(),
                icon: 'format_italic',
                isActive: (state) => state.isItalic,
                canUse: (state) => state.canItalic
            },
            {
                command: () => editor.chain().focus().toggleUnderline().run(),
                icon: 'format_underlined',
                isActive: () => editor.isActive('underline')
            },
            {
                command: () => editor.chain().focus().toggleStrike().run(),
                icon: 'strikethrough_s',
                isActive: (state) => state.isStrike,
                canUse: (state) => state.canStrike
            },
        ],
        [
            {
                type: "vr",
            }
        ],
        [
            {
                command: () => editor.chain().focus().toggleBulletList().run(),
                icon: 'format_list_bulleted',
                isActive: () => editor.isActive('bulletList')
            },
            {
                command: () => editor.chain().focus().toggleOrderedList().run(),
                icon: 'format_list_numbered',
                isActive: () => editor.isActive('orderedList')
            },
            {
                command: () => editor.chain().focus().toggleTaskList().run(),
                icon: 'checklist',
                isActive: () => editor.isActive('taskList')
            },
        ],
        [
            {
                type: "vr",
            }
        ],
        [
            {
                command: () => editor.chain().focus().toggleBlockquote().run(),
                icon: 'format_quote',
                isActive: () => editor.isActive('blockquote')
            },
            {
                command: () => editor.chain().focus().toggleCode().run(),
                icon: 'code',
                isActive: (state) => state.isCode,
                canUse: (state) => state.canCode
            },
            {
                command: () => editor.chain().focus().toggleCodeBlock().run(),
                icon: 'code_blocks',
                isActive: (state) => state.isCodeBlock
            },
        ],
        [
            {
                type: "vr",
            }
        ],
        [
            {
                command: () => setIsOpen(true),
                icon: 'image',
                isActive: () => false,
                label: 'Insert Image',
            },
            {
                command: () => {
                    const width = prompt('Enter image width (e.g., 200px or 50%)', '200px');
                    if (width && editor) {
                        editor.chain().focus().updateAttributes('image', { width }).run();
                    }
                },
                icon: 'photo_size_select_small', // Use an appropriate icon
                isActive: () => false,
                label: 'Set Image Width',
            }
        ],
        [
            {
                type: "vr",
            }
        ],
        [
            {
                command: () => editor.chain().focus().undo().run(),
                icon: 'undo',
                isActive: () => editor.can().undo(),
                isDisabled: () => !editor.can().undo()

            },
            {
                command: () => editor.chain().focus().redo().run(),
                icon: 'redo',
                isActive: () => editor.can().redo(),
                isDisabled: () => !editor.can().redo()
            },
        ],
    ];

    // Handle Tab key to insert tab or indent in code blocks/lists
    const handleKeyDown = (event) => {
        if (!editor) return;
        if (event.key === 'Tab') {
            event.preventDefault();
            // Try to indent list item or code block, otherwise insert tab character
            if (
                editor.isActive('codeBlock') && editor.commands.insertContent) {
                editor.commands.insertContent('\t');
            } else if (editor.can().sinkListItem('listItem')) {
                editor.commands.sinkListItem('listItem');
            } else {
                editor.commands.insertContent('\t');
            }
        }
        if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            if (editor.can().liftListItem('listItem')) {
                editor.commands.liftListItem('listItem');
            }
        }
    };

    if (!editor) return null;



    return (
        <EditorWrapper theme={theme}>
            <Toolbar>
                {toolbarGroups.map((group, groupIdx) => (
                    <div className="toolbar-group" key={groupIdx}>
                        {groupIdx === 0 && (
                            <div className="toolbar-select">
                                <select
                                    value={headingOptions.find(h => editor.isActive('heading', {level: h.level}))?.level || ''}
                                    onChange={e => {
                                        const level = Number(e.target.value);
                                        if (level) editor.chain().focus().setHeading({level}).run();
                                        else editor.chain().focus().setParagraph().run();
                                    }}
                                    style={{paddingRight: 30}}
                                >
                                    {headingOptions.map(opt => (
                                        <option key={opt.level} value={opt.level}>{opt.label}</option>
                                    ))}
                                </select>
                                <MaterialSymbol
                                    icon="arrow_drop_down"
                                    size={24}
                                />
                            </div>
                        )}
                        {group.map((btn, idx) => {
                            switch (btn.type) {
                                case 'select':
                                    return (
                                        <div className="toolbar-select" key={btn.icon + idx}>
                                            <select
                                                value={btn.value()}
                                                onChange={btn.onChange}
                                                style={{paddingRight: 30}}
                                            >
                                                {btn.options.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <MaterialSymbol
                                                icon="arrow_drop_down"
                                                size={24}
                                            />
                                        </div>
                                    );

                                case 'vr':
                                    return <div className={"toolbar-vr"} key={`vr-${idx}`}>
                                        <div></div>
                                    </div>;
                                default:
                                    return (
                                        <Button
                                            key={btn.icon + idx}
                                            $active={btn.isActive(editorState)}
                                            $disabled={btn.isDisabled ? btn.isDisabled() : false}
                                            disabled={btn.canUse ? !btn.canUse(editorState) : false}
                                            onClick={btn.command}
                                        >
                                            <MaterialSymbol
                                                size={25}
                                                grade={-25}
                                                weight={200}
                                                icon={btn.icon}
                                            />
                                        </Button>
                                    )
                            }
                        })}
                    </div>
                ))}
            </Toolbar>
            <EditorContent
                editor={editor}
                onKeyDown={handleKeyDown}
            />

            {isOpen && MediaLibraryDialog && (
                <MediaLibraryDialog
                    allowedTypes={['images', 'files', 'videos']} // optional
                    multiple={true}                            // optional
                    onClose={() => setIsOpen(false)}
                    onSelectAssets={handleSelect}
                />
            )}
        </EditorWrapper>
    );
};

Tiptap.displayName = "Tiptap";
export default Tiptap;

