"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/features/shared/template/page-header";
import { findGroup } from "../lib/pace-board";
import { useOpenBar, usePaceBoard } from "../hooks/use-pace";
import { PaceCaption } from "./PaceBoxes";
import { PaceDetail } from "./PaceDetail";
import { PaceForm, type FormMode } from "./PaceForm";
import { PaceBarRow } from "./PaceRow";

export function PaceGroupPage({ slug }: { slug: string }) {
  const pace = usePaceBoard();
  const detail = useOpenBar(pace.board);
  const [form, setForm] = useState<FormMode | null>(null);
  const group = pace.board ? findGroup(pace.board, slug) : null;
  const today = pace.board?.today ?? "";

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      <PageHeader
        title={group?.name ?? "Pace"}
        size="sm"
        className="px-3"
        breadcrumb={
          <Link href="/pace" aria-label="Back" className="inline-flex h-11 w-11 items-center">
            <ChevronLeft className="size-5" />
          </Link>
        }
        actions={
          group
            ? [
                { label: "Edit", variant: "outline", onClick: () => setForm({ mode: "edit-group", group }) },
                { label: "Add", onClick: () => setForm({ mode: "create", groupSlug: group.slug }) },
              ]
            : undefined
        }
      />
      {pace.isLoading ? (
        <p className="px-3 text-xs text-muted-foreground">Loading</p>
      ) : pace.error ? (
        <p className="px-3 text-xs text-destructive">{pace.error}</p>
      ) : !group ? (
        <p className="px-3 text-xs text-muted-foreground">Group not found</p>
      ) : (
        <div>
          <PaceCaption>Subjects</PaceCaption>
          {group.children.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No bars</p>
          ) : (
            group.children.map((bar) => (
              <PaceBarRow key={bar.id} bar={bar} onOpen={(focusNote) => detail.openBar(bar.slug, focusNote)} />
            ))
          )}
        </div>
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
        onEdit={(bar) => {
          detail.closeBar();
          setForm({ mode: "edit-bar", bar });
        }}
        onAdd={async (barSlug, input) => {
          const result = await pace.addEntry(barSlug, input);
          if (result.success) await detail.history.reload();
          return result.success ? { success: true } : { success: false, error: result.error };
        }}
        onUndo={async (barSlug) => {
          const result = await pace.undo(barSlug);
          if (result.success) await detail.history.reload();
          return result.success ? { success: true } : { success: false, error: result.error };
        }}
      />
      <PaceForm
        open={form != null}
        mode={form}
        groups={pace.board?.groups ?? []}
        today={today}
        onOpenChange={(open) => {
          if (!open) setForm(null);
        }}
        onCreateGroup={pace.createGroup}
        onCreateBar={pace.createBar}
        onUpdateGroup={pace.updateGroup}
        onUpdateBar={pace.updateBar}
      />
    </main>
  );
}
