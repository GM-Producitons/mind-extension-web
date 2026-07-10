import { FilePlus } from "lucide-react";
import type { DocumentType } from "../types";

interface EmptyDocumentStateProps {
  onCreate: (type?: DocumentType) => void;
}

export function EmptyDocumentState({ onCreate }: EmptyDocumentStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <FilePlus size={28} className="text-white/30" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-white/60">
          No document selected
        </p>
        <p className="text-xs text-white/30">
          Select a document from the sidebar or create a new one.
        </p>
      </div>
      <button
        onClick={() => onCreate()}
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        New document
      </button>
    </div>
  );
}
