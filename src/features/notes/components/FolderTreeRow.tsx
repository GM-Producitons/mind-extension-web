"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Note } from "../types";
import type { VaultTreeFolder } from "../hooks/use-notes-page";
import { NoteListItem } from "./NoteListItem";

interface FolderTreeRowProps {
  node: VaultTreeFolder;
  depth: number;
  isExpanded: boolean;
  isActive: boolean;
  selectedNoteId: string | null;
  onToggleExpand: () => void;
  onSelectFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (note: Note) => void;
  expandedFolderIds: Set<string>;
  onToggleFolderExpanded: (id: string) => void;
  onSelectFolderById: (id: string) => void;
  onRenameFolder: (folder: VaultTreeFolder["folder"]) => void;
  onDeleteFolder: (folder: VaultTreeFolder["folder"]) => void;
  activeFolderId: string | null;
}

export function FolderTreeRow({
  node,
  depth,
  isExpanded,
  isActive,
  selectedNoteId,
  onToggleExpand,
  onSelectFolder,
  onRename,
  onDelete,
  onSelectNote,
  onDeleteNote,
  expandedFolderIds,
  onToggleFolderExpanded,
  onSelectFolderById,
  onRenameFolder,
  onDeleteFolder,
  activeFolderId,
}: FolderTreeRowProps) {
  const hasChildren = node.children.length > 0 || node.notes.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex min-h-8 items-center gap-0.5 rounded-md pr-1",
          isActive ? "bg-accent" : "hover:bg-muted/60",
        )}
        style={{ paddingLeft: `${4 + depth * 12}px` }}
      >
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center text-muted-foreground"
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          onClick={onToggleExpand}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )
          ) : (
            <span className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onSelectFolder}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
        >
          <Folder className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs font-medium text-foreground">
            {node.folder.name}
          </span>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
              aria-label="Rename folder"
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rename</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
              aria-label="Delete folder"
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

      {isExpanded && (
        <div>
          {node.notes.map((note) => (
            <NoteListItem
              key={note._id}
              note={note}
              depth={depth + 1}
              isSelected={selectedNoteId === note._id}
              onSelect={() => onSelectNote(note._id)}
              onDelete={() => onDeleteNote(note)}
            />
          ))}
          {node.children.map((child) => (
            <FolderTreeRow
              key={child.folder._id}
              node={child}
              depth={depth + 1}
              isExpanded={expandedFolderIds.has(child.folder._id)}
              isActive={activeFolderId === child.folder._id}
              selectedNoteId={selectedNoteId}
              onToggleExpand={() => onToggleFolderExpanded(child.folder._id)}
              onSelectFolder={() => onSelectFolderById(child.folder._id)}
              onRename={() => onRenameFolder(child.folder)}
              onDelete={() => onDeleteFolder(child.folder)}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote}
              expandedFolderIds={expandedFolderIds}
              onToggleFolderExpanded={onToggleFolderExpanded}
              onSelectFolderById={onSelectFolderById}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              activeFolderId={activeFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
