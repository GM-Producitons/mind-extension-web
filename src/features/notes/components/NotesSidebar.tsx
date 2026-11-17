"use client";

import { useRef, useState } from "react";
import {
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Note, NoteFolder } from "../types";
import type { VaultTreeFolder } from "../hooks/use-notes-page";
import { FolderTreeRow } from "./FolderTreeRow";
import { NoteListItem } from "./NoteListItem";

interface NotesSidebarProps {
  folderTree: VaultTreeFolder[];
  rootNotes: Note[];
  selectedNoteId: string | null;
  activeFolderId: string | null;
  expandedFolderIds: Set<string>;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (q: string) => void;
  onCreateNote: () => void;
  onCreateFolder: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (note: Note) => void;
  onSetActiveFolder: (id: string | null) => void;
  onToggleFolderExpanded: (id: string) => void;
  onRenameFolder: (folder: NoteFolder) => void;
  onDeleteFolder: (folder: NoteFolder) => void;
}

export function NotesSidebar({
  folderTree,
  rootNotes,
  selectedNoteId,
  activeFolderId,
  expandedFolderIds,
  searchQuery,
  isLoading,
  onSearchChange,
  onCreateNote,
  onCreateFolder,
  onSelectNote,
  onDeleteNote,
  onSetActiveFolder,
  onToggleFolderExpanded,
  onRenameFolder,
  onDeleteFolder,
}: NotesSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const collapsed = !isMobile && isCollapsed;

  const handleOpenAndCreateNote = () => {
    setIsCollapsed(false);
    onCreateNote();
  };

  const handleOpenAndCreateFolder = () => {
    setIsCollapsed(false);
    onCreateFolder();
  };

  const handleOpenAndSearch = () => {
    setIsCollapsed(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);
  };

  const isEmpty =
    !isLoading &&
    folderTree.length === 0 &&
    rootNotes.length === 0 &&
    !searchQuery.trim();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? "100%" : collapsed ? 48 : 256,
      }}
      transition={{
        duration: 0.22,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-border bg-card overflow-hidden",
        isMobile ? "w-full" : undefined,
      )}
    >
      {/* Collapsed rail icons */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-12 flex-col items-center gap-1.5 py-2 px-1 transition-opacity duration-200",
          collapsed
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Open sidebar"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open sidebar</TooltipContent>
        </Tooltip>

        <div className="my-0.5 h-px w-6 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="New note"
              onClick={handleOpenAndCreateNote}
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New note</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="New folder"
              onClick={handleOpenAndCreateFolder}
            >
              <FolderPlus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New folder</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Search"
              onClick={handleOpenAndSearch}
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Search</TooltipContent>
        </Tooltip>
      </div>

      {/* Expanded sidebar content */}
      <div
        className={cn(
          "flex h-full w-64 shrink-0 flex-col transition-opacity duration-200",
          collapsed
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-2 py-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="New folder"
                  onClick={onCreateFolder}
                >
                  <FolderPlus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New folder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="New note"
                  onClick={onCreateNote}
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New note</TooltipContent>
            </Tooltip>
          </div>

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Close sidebar"
                  onClick={() => setIsCollapsed(true)}
                >
                  <PanelLeftClose className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Search */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-1 pb-3">
          {isLoading ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Loading
            </p>
          ) : isEmpty ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No notes yet
            </p>
          ) : (
            <>
              {folderTree.map((node) => (
                <FolderTreeRow
                  key={node.folder._id}
                  node={node}
                  depth={0}
                  isExpanded={expandedFolderIds.has(node.folder._id)}
                  isActive={activeFolderId === node.folder._id}
                  selectedNoteId={selectedNoteId}
                  onToggleExpand={() => onToggleFolderExpanded(node.folder._id)}
                  onSelectFolder={() => onSetActiveFolder(node.folder._id)}
                  onRename={() => onRenameFolder(node.folder)}
                  onDelete={() => onDeleteFolder(node.folder)}
                  onSelectNote={onSelectNote}
                  onDeleteNote={onDeleteNote}
                  expandedFolderIds={expandedFolderIds}
                  onToggleFolderExpanded={onToggleFolderExpanded}
                  onSelectFolderById={onSetActiveFolder}
                  onRenameFolder={onRenameFolder}
                  onDeleteFolder={onDeleteFolder}
                  activeFolderId={activeFolderId}
                />
              ))}
              {rootNotes.map((note) => (
                <NoteListItem
                  key={note._id}
                  note={note}
                  depth={0}
                  isSelected={selectedNoteId === note._id}
                  onSelect={() => onSelectNote(note._id)}
                  onDelete={() => onDeleteNote(note)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
