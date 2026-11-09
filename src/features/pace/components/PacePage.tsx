"use client";

import { useLayoutEffect, useState } from "react";
import { PageHeader } from "@/features/shared/template/page-header";
import { clearQuickCreate, hasQuickCreate, useQuickCreate } from "@/features/shared/store/quick-create.store";
import { useOpenBar, usePaceBoard } from "../hooks/use-pace";
import { PaceCaption } from "./PaceBoxes";
import { PaceDetail } from "./PaceDetail";
import { PaceForm, type FormMode } from "./PaceForm";
import { PaceBarRow, PaceGroupRow } from "./PaceRow";

export function PacePage() {
  const pace = usePaceBoard();
  const detail = useOpenBar(pace.board);
  const [form, setForm] = useState<FormMode | null>(null);
  const pending = useQuickCreate((state) => state.pending);
  const today = pace.board?.today ?? "";

  useLayoutEffect(() => {
    if (pending !== "pace" && !hasQuickCreate("pace")) return;
    setForm({ mode: "create" });
  }, [pending]);

  const closeForm = (open: boolean) => {
    if (open) return;
    setForm(null);
    clearQuickCreate("pace");
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      <PageHeader
        title="Ana fen fel a7mad?"
        size="sm"
        className="px-3"
        actions={[{ label: "Add", onClick: () => setForm({ mode: "create" }) }]}
      />
      {pace.isLoading ? (
        <p className="px-3 text-xs text-muted-foreground">Loading</p>
      ) : pace.error ? (
        <p className="px-3 text-xs text-destructive">{pace.error}</p>
      ) : pace.board && pace.board.groups.length === 0 && pace.board.solo.length === 0 ? (
        <p className="px-3 text-xs text-muted-foreground">No bars</p>
      ) : pace.board ? (
        <div>
          {pace.board.groups.length > 0 ? (
            <>
              <PaceCaption>Group</PaceCaption>
              {pace.board.groups.map((group) => (
                <PaceGroupRow key={group.id} group={group} />
              ))}
            </>
          ) : null}
          {pace.board.solo.length > 0 ? (
            <>
              <PaceCaption>Solo</PaceCaption>
              {pace.board.solo.map((bar) => (
                <PaceBarRow key={bar.id} bar={bar} onOpen={(focusNote) => detail.openBar(bar.slug, focusNote)} />
              ))}
            </>
          ) : null}
        </div>
      ) : null}
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
        onEdit={(bar) => {
          detail.closeBar();
          setForm({ mode: "edit-bar", bar });
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
      <PaceForm
        open={form != null}
        mode={form}
        groups={pace.board?.groups ?? []}
        today={today}
        onOpenChange={closeForm}
        onCreateGroup={pace.createGroup}
        onCreateBar={pace.createBar}
        onUpdateGroup={pace.updateGroup}
        onUpdateBar={pace.updateBar}
      />
    </main>
  );
}
