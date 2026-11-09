"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPaceStamp, formatStartDate, ruleLabel } from "../lib/pace-math";
import type { PaceBarView, PaceEntryView, PaceKind } from "../types";
import { PaceBoxes, PaceCaption, PaceStatusTag } from "./PaceBoxes";
import { PaceSheet } from "./PaceSheet";

export function PaceDetail({
  bar,
  today,
  focusNote,
  entries,
  historyTotal,
  historyError,
  onOpenChange,
  onEdit,
  onAdd,
  onUndo,
}: {
  bar: PaceBarView | null;
  today: string;
  focusNote: boolean;
  entries: PaceEntryView[];
  historyTotal: number;
  historyError: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (bar: PaceBarView) => void;
  onAdd: (slug: string, input: { kind: PaceKind; amount: number; note: string }) => Promise<{ success: boolean; error?: string }>;
  onUndo: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  return (
    <PaceSheet
      open={bar != null}
      onOpenChange={onOpenChange}
      title={bar?.name ?? "Bar"}
    >
      {bar ? (
        <DetailBody
          key={`${bar.id}:${focusNote ? "note" : "view"}`}
          bar={bar}
          today={today}
          focusNote={focusNote}
          entries={entries}
          historyTotal={historyTotal}
          historyError={historyError}
          onEdit={onEdit}
          onAdd={onAdd}
          onUndo={onUndo}
        />
      ) : null}
    </PaceSheet>
  );
}

function DetailBody({
  bar,
  today,
  focusNote,
  entries,
  historyTotal,
  historyError,
  onEdit,
  onAdd,
  onUndo,
}: {
  bar: PaceBarView;
  today: string;
  focusNote: boolean;
  entries: PaceEntryView[];
  historyTotal: number;
  historyError: string | null;
  onEdit?: (bar: PaceBarView) => void;
  onAdd: (slug: string, input: { kind: PaceKind; amount: number; note: string }) => Promise<{ success: boolean; error?: string }>;
  onUndo: (slug: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const noteRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<PaceKind>("done");
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const started = bar.startDate <= today;
  const canAdd = started && !bar.archived && note.trim().length > 0 && !pending;

  useEffect(() => {
    if (!focusNote) return;
    const handle = window.setTimeout(() => noteRef.current?.focus(), 250);
    return () => window.clearTimeout(handle);
  }, [focusNote]);

  const submit = async () => {
    if (!canAdd) return;
    setPending(true);
    const result = await onAdd(bar.slug, { kind, amount, note: note.trim() });
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not add");
      return;
    }
    setNote("");
    setAmount(1);
    toast.success(kind === "done" ? "Done added" : "Expected added");
  };

  const undo = async () => {
    setPending(true);
    const result = await onUndo(bar.slug);
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not undo");
      return;
    }
    toast.success("Undone");
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-pixel text-3xl tracking-wide">
          {bar.done}/{bar.expected}
          <span className="ml-2 text-sm text-muted-foreground">{bar.unit}</span>
        </p>
        <PaceStatusTag status={bar.status} owed={bar.owed} />
      </div>
      <p className="font-pixel text-[10px] text-muted-foreground">{bar.slug}</p>
      <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
        <dt className="font-pixel text-[10px] text-muted-foreground">STARTED</dt>
        <dd>{formatStartDate(bar.startDate)}</dd>
        <dt className="font-pixel text-[10px] text-muted-foreground">EXPECTED GROWS</dt>
        <dd>{ruleLabel(bar.expectedRule)}</dd>
      </dl>
      <PaceBoxes
        icon={bar.icon}
        color={bar.color}
        done={bar.done}
        owed={bar.owed}
        recentDone={bar.recentDone}
        recentExpected={bar.recentExpected}
        size={14}
      />
      {onEdit ? (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" className="h-11" onClick={() => onEdit(bar)}>
            Edit
          </Button>
        </div>
      ) : null}
      <PaceCaption>Correct</PaceCaption>
      <div className="grid grid-cols-2 gap-2">
        <Choice
          selected={kind === "done"}
          title="+ Done"
          detail="I did it, not logged"
          onClick={() => setKind("done")}
        />
        <Choice
          selected={kind === "expected"}
          title="+ Expected"
          detail="An event raised it"
          onClick={() => setKind("expected")}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="pace-amount">Amount ({bar.unit})</Label>
        <div className="flex w-fit items-center border border-border">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-11"
            aria-label="Decrease amount"
            disabled={amount <= 1}
            onClick={() => setAmount((current) => Math.max(1, current - 1))}
          >
            −
          </Button>
          <span className="font-pixel w-8 text-center">{amount}</span>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-11"
            aria-label="Increase amount"
            disabled={amount >= 99}
            onClick={() => setAmount((current) => Math.min(99, current + 1))}
          >
            +
          </Button>
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="pace-note">Note</Label>
        <Input
          id="pace-note"
          ref={noteRef}
          className="h-11"
          value={note}
          placeholder="What did you do?"
          maxLength={200}
          disabled={!started || bar.archived}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
        />
      </div>
      {bar.noteChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {bar.noteChips.map((chip) => (
            <Button
              key={chip}
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setNote(chip)}
            >
              {chip}
            </Button>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        className="h-11 bg-pace-done font-pixel text-background hover:bg-pace-done/90"
        disabled={!canAdd}
        onClick={() => void submit()}
      >
        ADD +{amount} {kind === "done" ? "DONE" : "EXPECTED"}
      </Button>
      {bar.undo ? (
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-xs text-muted-foreground">
            Your last: +{bar.undo.amount} {bar.undo.kind}, “{bar.undo.note}”
          </p>
          <Button type="button" variant="outline" className="h-11 shrink-0" disabled={pending} onClick={() => void undo()}>
            Undo
          </Button>
        </div>
      ) : null}
      <PaceCaption trailing={historyTotal > 0 ? `${historyTotal} entries` : undefined}>
        History
      </PaceCaption>
      {historyError ? <p className="text-xs text-destructive">{historyError}</p> : null}
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries</p>
      ) : (
        <div>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={entry.voidedAt ? "border-b border-border py-2 line-through opacity-50" : "border-b border-border py-2"}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={entry.kind === "done" ? "font-pixel text-[10px] text-pace-done" : "font-pixel text-[10px] text-destructive"}>
                  +{entry.amount} {entry.kind === "done" ? "DONE" : "EXPECTED"}
                </span>
                <span className="font-pixel border border-border px-1 text-[10px]">
                  {entry.source === "grok" ? "GROK" : "YOU"}
                </span>
              </div>
              <p className="text-sm break-words">{entry.note}</p>
              <p className="font-pixel text-[10px] text-muted-foreground">
                {formatPaceStamp(new Date(entry.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Choice({
  selected,
  title,
  detail,
  onClick,
}: {
  selected: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={selected ? "min-h-11 border border-pace-done px-2 py-2 text-left" : "min-h-11 border border-border px-2 py-2 text-left"}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="font-pixel block text-[10px] text-pace-done">{title}</span>
      <span className="block text-xs text-muted-foreground">{detail}</span>
    </button>
  );
}
