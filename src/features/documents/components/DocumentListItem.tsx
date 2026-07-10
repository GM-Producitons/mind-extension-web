import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document } from "../types";
import { DOCUMENT_TYPE_LABELS } from "../types";

interface DocumentListItemProps {
  document: Document;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentListItem({
  document,
  isSelected,
  onSelect,
  onDelete,
}: DocumentListItemProps) {
  const displayTitle = document.title.trim() || "Untitled";
  const relativeDate = formatDistanceToNow(new Date(document.updatedAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={() => onSelect(document._id)}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors",
        isSelected
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white/80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-medium leading-snug">
          {displayTitle}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(document._id);
          }}
          className="mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
          aria-label="Delete document"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
          {DOCUMENT_TYPE_LABELS[document.type]}
        </span>
        <span className="truncate text-[11px] text-white/30">
          {relativeDate}
        </span>
      </div>
    </div>
  );
}
