import {TextStyleKit} from '@tiptap/extension-text-style'
import {EditorContent, Mark, mergeAttributes, useEditor, useEditorState} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import {Button as StrapiButton} from '@strapi/design-system';
import styled, {css, useTheme} from 'styled-components';
import {CodeBlockLowlight} from '@tiptap/extension-code-block-lowlight';
import {common, createLowlight} from 'lowlight'
import {MaterialSymbol} from "react-material-symbols";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import {toHtml} from 'hast-util-to-html'

import 'react-material-symbols/outlined';
import {useEffect, useState} from "react";

const lowlight = createLowlight(common)

const EditorWrapper = styled.div`
    ${({$hasError = false, $isExpanded = false, theme}) => css`
        height: ${$isExpanded ? '100%' : 'auto'};
        border-radius: ${theme.borderRadius};
        outline: none;
        box-shadow: none;
        transition-property: border-color, box-shadow, fill;
        transition-duration: 0.2s;
        border: unset;
        background: #19191a;
        overflow: hidden;
        border-radius: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        width: 100%;
        border: 1px solid ${$isExpanded ? theme.colors.neutral200 : theme.colors.primary600};

        > div:first-child {
        }

        > div:last-child {
            width: 100%;
        }

        .ProseMirror {
            min-height: 550px;
            margin-bottom: 20px;
            padding: 20px;
            padding-bottom: 0;
            border-radius: ${theme.borderRadius};
            outline: none;
            font-size: 1.5rem;
            line-height: 1.6;
            background: inherit;
            box-shadow: 0 1px 2px rgba(16, 30, 54, 0.04);
            font-weight: 300;
            max-height: 550px;
            overflow-y: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            * {
                width: 100%;
                max-width: 640px;
            }

            h1 {
                font-size: 4rem;
                font-weight: 600;
            }

            h2 {
                font-size: 3rem;
                font-weight: 600;
            }

            h3 {
                font-size: 2rem;
                font-weight: 600;
            }

            h4 {
                font-size: 1.8rem;
                font-weight: 600;
            }

            h5 {
                font-size: 1.65rem;
                font-weight: 600;
            }

            h6 {
                font-size: 1.5rem;
                font-weight: 600;
            }

            p {
                font-size: 1.5rem;
            }

            blockquote {
                border-left: 4px solid ${theme.colors.primary600};
                margin: 1.5em 10px;
                padding: 0.5em 1em;
                color: ${theme.colors.neutral800};
                background: ${theme.colors.neutral100};
                font-style: italic;
            }

            ul, ol {
                margin: 0.5rem 0 0.5rem 1.5rem;
                padding-left: 1.5rem;
            }

            ul {
                list-style-type: disc;
            }

            ol {
                list-style-type: decimal;
            }

            li {
                margin-bottom: 0.25rem;
            }

            ul[data-type="taskList"] {
                padding: 0;
                margin: 0;

                li {
                    padding: 0;
                    margin: 0;
                    margin-bottom: 0.25rem;
                    display: flex;
                    flex-wrap: nowrap;
                    gap: 10px;
                }
            }

            strong {
                font-weight: 900;
            }

            > code, p > code, pre {
                background-color: #e8e8fd0d;
                font-family: 'Courier New', Courier, monospace;
                border-radius: 5px;
                border: 1px solid #eeeef61c;
                font-size: 1.4rem;
            }

            > code, p > code {
                padding: 5px 10px;
                margin: 5px;
            }

            pre {
                color: #fff;
                margin: 1.5rem 0;
                padding: 15px;
                overflow-x: auto;

                code {
                    background: none;
                    color: inherit;
                    font-size: inherit;
                    padding: 0;
                }
            }

            code {
                .hljs-comment,
                .hljs-quote {
                    color: #6a9955;
                }

                .hljs-variable,
                .hljs-template-variable,
                .hljs-attribute,
                .hljs-tag,
                .hljs-name,
                .hljs-regexp,
                .hljs-link,
                .hljs-selector-id,
                .hljs-selector-class {
                    color: #9cdcfe;
                }

                .hljs-number,
                .hljs-meta,
                .hljs-built_in,
                .hljs-builtin-name,
                .hljs-literal,
                .hljs-type,
                .hljs-params {
                    color: #b5cea8;
                }

                .hljs-string,
                .hljs-symbol,
                .hljs-bullet {
                    color: #ce9178;
                }

                .hljs-title,
                .hljs-section {
                    color: #dcdcaa;
                }

                .hljs-keyword,
                .hljs-selector-tag {
                    color: #569cd6;
                }

                .hljs-emphasis {
                    font-style: italic;
                }

                .hljs-strong {
                    font-weight: 700;
                }
            }
        }
    `}
`;

const Toolbar = styled.div`
    display: flex;
    flex-wrap: wrap;
    background-color: #111111;
    padding: 10px;
    gap: 5px;
    margin: 15px;
    margin-bottom: 0;
    border-radius: 15px;

    & > .toolbar-group {
        display: flex;
        gap: 5px;

        & > {
            .toolbar-vr {
                width: 10px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                > div {
                    width: 1px;
                    height: 50%;
                    background-color: #ffffff15;
                }
            }

            .toolbar-select, button {
                font-size: 15px;
                border-radius: 10px;
                background-color: #19191a;
            }

            .toolbar-select {
                color: ${({theme}) => theme.colors.neutral800};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                width: 120px;

                &:focus {
                    outline: none;
                    border-color: ${({theme}) => theme.colors.primary600};
                }

                select {
                    padding: 5px 10px;
                    padding-right: 40px;
                    background-color: transparent;
                    border: none;
                    color: inherit;
                    font-size: inherit;
                    -webkit-appearance: none;
                    appearance: none;
                    -moz-appearance: none;
                    width: 100%;
                    height: 100%;

                    &:focus {
                        outline: none;
                    }
                }

                span {
                    position: absolute;
                    right: 5px;
                    pointer-events: none;
                    touch-action: none;
                }
            }

            button {
                padding: 5px;
                width: unset;
                height: unset;
                min-width: unset;
                min-height: unset;
                display: flex;
                justify-content: center;
                align-content: center;
                border: none;
                box-shadow: none;
                aspect-ratio: 1 / 1;

                &:hover {
                    background: ${({theme}) => theme.colors.primary050};
                }

                > span {
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    line-height: 0;
                }
            }
        }
    }
`;

const Button = styled(StrapiButton)`
    color: ${({$active, theme}) => $active ? theme.colors.primary700 : theme.colors.neutral800};
    opacity: ${({$disabled, theme}) => $disabled ? 0.2 : 1};
    pointer-events: ${({$disabled}) => $disabled ? 'none' : 'auto'};
    touch-action: ${({$disabled}) => $disabled ? 'none' : 'auto'};
`;

export const InlineCodeLowlight = Mark.create({
    name: 'inlineCodeLowlight',
    code: true,
    group: 'inline',
    parseHTML() {
        return [
            { tag: 'code' },
        ];
    },
    renderHTML({ HTMLAttributes, node }) {
        const code = node.textContent || '';
        const tree = lowlight.highlight('js', code);
        return [
            'code',
            mergeAttributes(HTMLAttributes, { class: 'hljs' }),
            toHtml(tree)
        ];
    },
})

const Tiptap = ({
                    name,
                    error,
                    description,
                    onChange,
                    value,
                    intlLabel,
                    attribute,
                }) => {
    const theme = useTheme();

    const [editorValue, setEditorValue] = useState(value || '<p></p>');

    useEffect(() => {
        console.log('Editor value changed:', editorValue);

        onChange({
            target:
                {
                    name,
                    value: editorValue,
                    type: attribute.type
                }
        })
    }, [editorValue]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Disable default heading in StarterKit
                codeBlock: false, // Disable default codeBlock
            }),
            Heading.configure({levels: [1, 2, 3, 4, 5, 6]}),
            Underline,
            Strike,
            InlineCodeLowlight,
            CodeBlockLowlight.configure({
                languageClassPrefix: 'language-',
                defaultLanguage: 'javascript',
                lowlight,
            }),
            TaskList,
            TaskItem,
            TextAlign.configure({types: ['heading', 'paragraph']}),
        ],
        content: editorValue,
        onUpdate: ({editor}) => {
            setEditorValue(highlightInlineCode(editor.getHTML()))
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
        ]
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
        </EditorWrapper>
    );
};

Tiptap.displayName = "Tiptap";
export default Tiptap;

