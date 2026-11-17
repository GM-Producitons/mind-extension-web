"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView, highlightActiveLine } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Prec } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { livePreviewPlugin } from "./live-preview-plugin";

export interface LiveMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const markdownHighlightOverride = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [
        tags.heading,
        tags.heading1,
        tags.heading2,
        tags.heading3,
        tags.heading4,
        tags.heading5,
        tags.heading6,
      ],
      textDecoration: "none",
    },
  ]),
);

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    fontSize: "0.9375rem",
    height: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-content": {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    caretColor: "var(--foreground)",
    padding: "1rem 1.25rem",
    minHeight: "100%",
  },
  ".cm-line": {
    padding: "0 4px",
    lineHeight: "1.65",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--notes-active-line)",
    borderRadius: "0.25rem",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-live-h1": {
    fontSize: "2.25rem",
    fontWeight: "750",
    lineHeight: "1.25",
    color: "var(--notes-h1)",
    paddingTop: "0.5rem",
    paddingBottom: "0.25rem",
  },
  ".cm-live-h2": {
    fontSize: "1.75rem",
    fontWeight: "700",
    lineHeight: "1.3",
    color: "var(--notes-h2)",
    paddingTop: "0.35rem",
    paddingBottom: "0.2rem",
  },
  ".cm-live-h3": {
    fontSize: "1.4rem",
    fontWeight: "650",
    lineHeight: "1.35",
    color: "var(--notes-h3)",
    paddingTop: "0.25rem",
    paddingBottom: "0.15rem",
  },
  ".cm-live-h4": {
    fontSize: "1.2rem",
    fontWeight: "600",
    lineHeight: "1.4",
    color: "var(--notes-h4)",
    paddingTop: "0.2rem",
    paddingBottom: "0.1rem",
  },
  ".cm-live-h5": {
    fontSize: "1.075rem",
    fontWeight: "600",
    lineHeight: "1.4",
    color: "var(--notes-h5)",
    paddingTop: "0.15rem",
  },
  ".cm-live-h6": {
    fontSize: "0.975rem",
    fontWeight: "600",
    lineHeight: "1.45",
    color: "var(--notes-h6)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  ".cm-live-h1, .cm-live-h1 *:not(.cm-live-link), .cm-live-h2, .cm-live-h2 *:not(.cm-live-link), .cm-live-h3, .cm-live-h3 *:not(.cm-live-link), .cm-live-h4, .cm-live-h4 *:not(.cm-live-link), .cm-live-h5, .cm-live-h5 *:not(.cm-live-link), .cm-live-h6, .cm-live-h6 *:not(.cm-live-link)":
    {
      textDecoration: "none !important",
      borderBottom: "none !important",
    },
  ".cm-live-strong": {
    fontWeight: "700",
  },
  ".cm-live-emphasis": {
    fontStyle: "italic",
  },
  ".cm-live-code": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    fontSize: "0.875em",
    backgroundColor: "var(--muted)",
    borderRadius: "0.25rem",
    padding: "0.1em 0.25em",
  },
  ".cm-live-blockquote": {
    borderLeft: "3px solid var(--border)",
    paddingLeft: "0.75rem",
    color: "var(--muted-foreground)",
  },
  ".cm-live-link": {
    color: "var(--primary)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  ".cm-live-highlight": {
    backgroundColor: "var(--notes-highlight)",
    borderRadius: "0.2rem",
    padding: "0.05em 0.15em",
    boxDecorationBreak: "clone",
  },
  ".cm-live-task-checkbox": {
    marginRight: "0.35rem",
    verticalAlign: "middle",
    accentColor: "var(--primary)",
    cursor: "pointer",
  },
  ".cm-live-bullet": {
    display: "inline-block",
    width: "0.35rem",
    height: "0.35rem",
    borderRadius: "9999px",
    backgroundColor: "currentColor",
    opacity: "0.75",
    marginRight: "0.35rem",
    verticalAlign: "0.15em",
  },
  ".cm-live-bullet-nested": {
    backgroundColor: "transparent",
    border: "1.2px solid currentColor",
    opacity: "0.85",
  },
});

export function LiveMarkdownEditor({
  value,
  onChange,
  className,
}: LiveMarkdownEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      className={className}
      theme="none"
      extensions={[
        markdown({ base: markdownLanguage }),
        Prec.high(markdownHighlightOverride),
        editorTheme,
        livePreviewPlugin,
        EditorView.lineWrapping,
        highlightActiveLine(),
      ]}
      onChange={onChange}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
      }}
    />
  );
}
