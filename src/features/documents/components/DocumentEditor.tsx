"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import type { JSONContent } from "@tiptap/react";

interface DocumentEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  documentId: string;
}

export function DocumentEditor({
  content,
  onChange,
  documentId,
}: DocumentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing… (# heading, - list, **bold**, _italic_)",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-white/20 before:pointer-events-none before:h-0",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[60vh] outline-none focus:outline-none px-10 py-6 text-white/80 leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  // Re-initialize content when switching documents
  useEffect(() => {
    if (!editor) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const incomingJson = JSON.stringify(content);
    if (currentJson !== incomingJson) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  return (
    <div className="flex-1 overflow-y-auto">
      <EditorContent editor={editor} />
    </div>
  );
}
