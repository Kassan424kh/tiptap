import styled, {css} from 'styled-components';
import {Button as StrapiButton} from '@strapi/design-system';

export const EditorWrapper = styled.div`
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
                min-height: max-content;
                max-height: max-content;

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

export const Toolbar = styled.div`
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

export const Button = styled(StrapiButton)`
    color: ${({$active, theme}) => $active ? theme.colors.primary700 : theme.colors.neutral800};
    opacity: ${({$disabled, theme}) => $disabled ? 0.2 : 1};
    pointer-events: ${({$disabled}) => $disabled ? 'none' : 'auto'};
    touch-action: ${({$disabled}) => $disabled ? 'none' : 'auto'};
`;
