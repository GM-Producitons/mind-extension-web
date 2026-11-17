"use client";

import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Note } from "../types";

interface NoteListItemProps {
  note: Note;
  depth: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function NoteListItem({
  note,
  depth,
  isSelected,
  onSelect,
  onDelete,
}: NoteListItemProps) {
  return (
    <div
      className={cn(
        "group flex min-h-8 items-center gap-1 rounded-md pr-1",
        isSelected ? "bg-accent" : "hover:bg-muted/60",
      )}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
      >
        <FileText className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs text-foreground">
          {note.title.trim() || "Untitled"}
        </span>
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
            aria-label="Delete note"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
}
