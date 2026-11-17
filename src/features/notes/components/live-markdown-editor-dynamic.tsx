"use client";

import dynamic from "next/dynamic";
import type { LiveMarkdownEditorProps } from "./live-markdown-editor";

const LiveMarkdownEditor = dynamic(
  () =>
    import("./live-markdown-editor").then((mod) => mod.LiveMarkdownEditor),
  { ssr: false },
);

export function LiveMarkdownEditorDynamic(props: LiveMarkdownEditorProps) {
  return <LiveMarkdownEditor {...props} />;
}
