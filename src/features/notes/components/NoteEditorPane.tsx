"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveMarkdownEditorDynamic } from "./live-markdown-editor-dynamic";
import type { Note } from "../types";

interface NoteEditorPaneProps {
  note: Note;
  isSaving: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onTitleChange: (title: string) => void;
  onMarkdownChange: (markdown: string) => void;
}

export function NoteEditorPane({
  note,
  isSaving,
  showBack,
  onBack,
  onTitleChange,
  onMarkdownChange,
}: NoteEditorPaneProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:px-4">
        {showBack && onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Back to list"
            onClick={onBack}
          >
            <ChevronLeft className="size-5" />
          </Button>
        ) : null}
        <Input
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="h-8 border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />
        {isSaving ? (
          <span className="shrink-0 text-xs text-muted-foreground">Saving</span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <LiveMarkdownEditorDynamic
          value={note.markdown}
          onChange={onMarkdownChange}
          className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
        />
      </div>
    </div>
  );
}
