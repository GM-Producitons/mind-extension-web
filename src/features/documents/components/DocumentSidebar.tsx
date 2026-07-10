import { Plus, Search } from "lucide-react";
import type { Document, DocumentType } from "../types";
import { DocumentListItem } from "./DocumentListItem";

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocumentId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (id: string) => void;
  onCreate: (type?: DocumentType) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function DocumentSidebar({
  documents,
  selectedDocumentId,
  searchQuery,
  onSearchChange,
  onSelect,
  onCreate,
  onDelete,
  isLoading,
}: DocumentSidebarProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-white/10 bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-semibold text-white/80">Documents</span>
        <button
          onClick={() => onCreate()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="New document"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">
          <Search size={13} className="shrink-0 text-white/30" />
          <input
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-xs text-white/70 outline-none placeholder:text-white/25"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <div className="mt-8 text-center text-xs text-white/30">Loading…</div>
        ) : documents.length === 0 ? (
          <div className="mt-8 text-center text-xs text-white/30">
            {searchQuery ? "No documents match." : "No documents yet."}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {documents.map((doc) => (
              <DocumentListItem
                key={doc._id}
                document={doc}
                isSelected={selectedDocumentId === doc._id}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
