import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import { Button as StrapiButton } from '@strapi/design-system';
import styled, { css, useTheme } from 'styled-components';
import Icon from 'react-google-material-icons';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import {common, createLowlight} from 'lowlight'

const lowlight = createLowlight(common)

const EditorWrapper = styled.div`
  ${({ $hasError = false, $isExpanded = false, theme }) => css`
    height: ${$isExpanded ? '100%' : 'auto'};
    border-radius: ${theme.borderRadius};
    outline: none;
    box-shadow: none;
    transition-property: border-color, box-shadow, fill;
    transition-duration: 0.2s;
    border: unset;
    background: black;
    overflow: hidden;
    border-radius: 15px;
    position: relative;
    border: 1px solid ${$isExpanded ? theme.colors.neutral200 : theme.colors.primary600};

    .ProseMirror {
      min-height: 550px;
      padding: 20px;
      border-radius: ${theme.borderRadius};
      outline: none;
      font-size: 2rem;
      line-height: 1.6;
      background: black;
      box-shadow: 0 1px 2px rgba(16, 30, 54, 0.04);
      font-weight: 100;
      max-height: 550px;
      overflow-y: auto;

      h1 {
        font-size: 4rem;
        font-weight: bold;
        margin: 2rem 0 0.5rem 0;
      }

      h2 {
        font-size: 3rem;
        font-weight: bold;
        margin: 0.75rem 0 0.4rem 0;
      }

      h3 {
        font-size: 2rem;
        font-weight: bold;
        margin: 0.5rem 0 0.3rem 0;
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

      strong {
        font-weight: 900;
      }

      > code {
        font-family: 'Courier New', Courier, monospace;
        background-color: ${theme.colors.neutral100};
        padding: 10px;
        border-radius: 5px;
      }


      pre {
        background: ${theme.colors.neutral100};
        color: #fff;
        font-family: 'JetBrainsMono', monospace;
        margin: 1.5rem 0;
        padding: 15px;
        border-radius: 5px;

          code {
            background: none;
            color: inherit;
            padding: 0;
          }

          /* Code styling */
          .hljs-comment,
          .hljs-quote {
            color: #616161;
          }

          .hljs-variable,
          .hljs-template-variable,
          .hljs-attribute,
          .hljs-tag,
          .hljs-name,
          .hljs-regexp,
          .hljs-link,
          .hljs-name,
          .hljs-selector-id,
          .hljs-selector-class {
            color: #f98181;
          }

          .hljs-number,
          .hljs-meta,
          .hljs-built_in,
          .hljs-builtin-name,
          .hljs-literal,
          .hljs-type,
          .hljs-params {
            color: #fbbc88;
          }

          .hljs-string,
          .hljs-symbol,
          .hljs-bullet {
            color: #b9f18d;
          }

          .hljs-title,
          .hljs-section {
            color: #faf594;
          }

          .hljs-keyword,
          .hljs-selector-tag {
            color: #70cff8;
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
  margin-bottom: 0.5rem;
  background-color: ${({ theme }) => theme.colors.neutral0};
  padding: 10px;
  gap: 5px;
`;

const Button = styled(StrapiButton)`
  padding: 10px;
  width: unset;
  height: unset;
  font-size: 0.85rem;
  min-width: unset;
  min-height: unset;
  display: flex;
  justify-content: center;
  align-content: center;
  background: ${({ $active, theme }) => $active ? theme.colors.primary100 : theme.colors.neutral0};
  color: ${({ $active, theme }) => $active ? theme.colors.primary700 : theme.colors.neutral800};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary600 : theme.colors.neutral200};
  box-shadow: none;
  border-radius: 10px;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors.primary050};
  }

  > span {
    display: flex;
    justify-content: center;
    align-content: center;
    line-height: 0;
    i {
      font-size: 16px !important;
    }
  }
`;

const Tiptap = () => {
  const theme = useTheme();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading in StarterKit
        codeBlock: false, // Disable default codeBlock
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Strike,
      Code,
      CodeBlockLowlight.configure({
        languageClassPrefix: 'language-',
        defaultLanguage: 'javascript',
        lowlight,
      }),
    ],
    content: '<p>Hello World!</p>',
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
        isHeading1: ctx.editor.isActive('heading', { level: 1 }),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isHeading4: ctx.editor.isActive('heading', { level: 4 }),
        isHeading5: ctx.editor.isActive('heading', { level: 5 }),
        isHeading6: ctx.editor.isActive('heading', { level: 6 }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  });

  const toolbarButtons = [
    { command: () => editor.chain().focus().toggleBold().run(), icon: 'format_bold', isActive: (state) => state.isBold, canUse: (state) => state.canBold },
    { command: () => editor.chain().focus().toggleItalic().run(), icon: 'format_italic', isActive: (state) => state.isItalic, canUse: (state) => state.canItalic },
    { command: () => editor.chain().focus().toggleUnderline().run(), icon: 'format_underlined', isActive: () => editor.isActive('underline') },
    { command: () => editor.chain().focus().toggleStrike().run(), icon: 'strikethrough_s', isActive: (state) => state.isStrike, canUse: (state) => state.canStrike },
    { command: () => editor.chain().focus().toggleCode().run(), icon: 'code', isActive: (state) => state.isCode, canUse: (state) => state.canCode },
    { command: () => editor.chain().focus().toggleBulletList().run(), icon: 'format_list_bulleted', isActive: () => editor.isActive('bulletList') },
    { command: () => editor.chain().focus().toggleOrderedList().run(), icon: 'format_list_numbered', isActive: () => editor.isActive('orderedList') },
    { command: () => editor.chain().focus().toggleBlockquote().run(), icon: 'format_quote', isActive: () => editor.isActive('blockquote') },
    { command: () => editor.chain().focus().setHeading({ level: 1 }).run(), icon: 'looks_one', isActive: () => editor.isActive('heading', { level: 1 }) },
    { command: () => editor.chain().focus().setHeading({ level: 2 }).run(), icon: 'looks_two', isActive: () => editor.isActive('heading', { level: 2 }) },
    { command: () => editor.chain().focus().setHeading({ level: 3 }).run(), icon: 'looks_3', isActive: () => editor.isActive('heading', { level: 3 }) },
    { command: () => editor.chain().focus().toggleCodeBlock().run(), icon: 'code', isActive: (state) => state.isCodeBlock },
    { command: () => editor.chain().focus().undo().run(), icon: 'undo', isActive: () => false },
    { command: () => editor.chain().focus().redo().run(), icon: 'redo', isActive: () => false },
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
        {toolbarButtons.map((btn, idx) => (
          <Button
            key={btn.icon + idx}
            $active={btn.isActive(editorState)}
            disabled={btn.canUse ? !btn.canUse(editorState) : false}
            onClick={btn.command}
          >
            <Icon
              style={{ fontSize: '20px', color: btn.isActive(editorState) ? theme.colors.primary600 : theme.colors.neutral600 }}
              icon={btn.icon}
            />
          </Button>
        ))}
      </Toolbar>
      <EditorContent editor={editor} onKeyDown={handleKeyDown} />
    </EditorWrapper>
  );
};

Tiptap.displayName = "Tiptap";
export default Tiptap;
