"use client";

import Link from "next/link";
import { topOwedBars } from "../lib/pace-board";
import { useOpenBar, usePaceBoard } from "../hooks/use-pace";
import { PaceDetail } from "./PaceDetail";
import { PaceBarRow } from "./PaceRow";

export function PaceHome() {
  const pace = usePaceBoard();
  const detail = useOpenBar(pace.board);
  const bars = pace.board ? topOwedBars(pace.board) : [];
  const today = pace.board?.today ?? "";

  return (
    <section className="mt-8 border-t border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <h2 className="text-base font-semibold">Ana fen fel a7mad?</h2>
        <Link href="/pace" className="text-sm text-muted-foreground">
          See all
        </Link>
      </div>
      {pace.isLoading ? (
        <p className="px-3 pb-2 text-xs text-muted-foreground">Loading</p>
      ) : pace.error ? (
        <p className="px-3 pb-2 text-xs text-destructive">{pace.error}</p>
      ) : bars.length === 0 ? (
        <p className="px-3 pb-2 text-xs text-muted-foreground">No bars</p>
      ) : (
        bars.map((bar) => (
          <PaceBarRow key={bar.id} bar={bar} onOpen={(focusNote) => detail.openBar(bar.slug, focusNote)} />
        ))
      )}
      <PaceDetail
        bar={detail.bar}
        today={today}
        focusNote={detail.focusNote}
        entries={detail.history.entries}
        historyTotal={detail.history.total}
        historyError={detail.history.error}
        onOpenChange={(open) => {
          if (!open) detail.closeBar();
        }}
        onAdd={async (slug, input) => {
          const result = await pace.addEntry(slug, input);
          if (result.success) await detail.history.reload();
          return result.success ? { success: true } : { success: false, error: result.error };
        }}
        onUndo={async (slug) => {
          const result = await pace.undo(slug);
          if (result.success) await detail.history.reload();
          return result.success ? { success: true } : { success: false, error: result.error };
        }}
      />
    </section>
  );
}
