"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/features/shared/template/confirm-dialog";
import { PACE_ICONS } from "../lib/icons";
import type { PaceBarView, PaceGroupView, PacePeriod } from "../types";
import { PaceIcon } from "./PaceIcon";
import { PaceSheet } from "./PaceSheet";

export type FormMode =
  | { mode: "create"; groupSlug?: string }
  | { mode: "edit-group"; group: PaceGroupView }
  | { mode: "edit-bar"; bar: PaceBarView };

export function PaceForm({
  open,
  mode,
  groups,
  today,
  onOpenChange,
  onCreateGroup,
  onCreateBar,
  onUpdateGroup,
  onUpdateBar,
}: {
  open: boolean;
  mode: FormMode | null;
  groups: PaceGroupView[];
  today: string;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (input: unknown) => Promise<{ success: boolean; error?: string }>;
  onCreateBar: (input: unknown) => Promise<{ success: boolean; error?: string }>;
  onUpdateGroup: (slug: string, input: unknown) => Promise<{ success: boolean; error?: string }>;
  onUpdateBar: (slug: string, input: unknown) => Promise<{ success: boolean; error?: string }>;
}) {
  const title =
    mode?.mode === "edit-group"
      ? "Edit group"
      : mode?.mode === "edit-bar"
        ? "Edit bar"
        : "New pace";
  return (
    <PaceSheet open={open} onOpenChange={onOpenChange} title={title}>
      {open && mode ? (
        <PaceFormBody
          key={formKey(mode)}
          mode={mode}
          groups={groups}
          today={today}
          onClose={() => onOpenChange(false)}
          onCreateGroup={onCreateGroup}
          onCreateBar={onCreateBar}
          onUpdateGroup={onUpdateGroup}
          onUpdateBar={onUpdateBar}
        />
      ) : null}
    </PaceSheet>
  );
}

function formKey(mode: FormMode) {
  if (mode.mode === "edit-group") return `group:${mode.group.id}`;
  if (mode.mode === "edit-bar") return `bar:${mode.bar.id}`;
  return `create:${mode.groupSlug ?? "any"}`;
}

function PaceFormBody({
  mode,
  groups,
  today,
  onClose,
  onCreateGroup,
  onCreateBar,
  onUpdateGroup,
  onUpdateBar,
}: {
  mode: FormMode;
  groups: PaceGroupView[];
  today: string;
  onClose: () => void;
  onCreateGroup: (input: unknown) => Promise<{ success: boolean; error?: string }>;
  onCreateBar: (input: unknown) => Promise<{ success: boolean; error?: string }>;
  onUpdateGroup: (slug: string, input: unknown) => Promise<{ success: boolean; error?: string }>;
  onUpdateBar: (slug: string, input: unknown) => Promise<{ success: boolean; error?: string }>;
}) {
  const editingGroup = mode.mode === "edit-group" ? mode.group : null;
  const editingBar = mode.mode === "edit-bar" ? mode.bar : null;
  const locked = groups.find((group) => group.slug === (mode.mode === "create" ? mode.groupSlug : undefined)) ?? null;
  const [kind, setKind] = useState<"group" | "bar">(editingGroup ? "group" : "bar");
  const [name, setName] = useState(editingGroup?.name ?? editingBar?.name ?? "");
  const [icon, setIcon] = useState(editingGroup?.icon ?? editingBar?.icon ?? "target");
  const [unit, setUnit] = useState(editingGroup?.unit ?? editingBar?.unit ?? locked?.unit ?? "");
  const [groupSlug, setGroupSlug] = useState(
    locked?.slug ?? editingBar?.groupSlug ?? "solo",
  );
  const [startDate, setStartDate] = useState(editingBar?.startDate ?? today);
  const [ruleType, setRuleType] = useState<"schedule" | "events" | "both">(
    editingBar?.expectedRule.type ?? "events",
  );
  const [amount, setAmount] = useState(editingBar?.expectedRule.amount ?? 1);
  const [period, setPeriod] = useState<PacePeriod>(editingBar?.expectedRule.period ?? "week");
  const [chips, setChips] = useState<string[]>(editingBar?.noteChips ?? []);
  const [chipDraft, setChipDraft] = useState("");
  const [pending, setPending] = useState(false);

  const selectedGroup = groups.find((group) => group.slug === groupSlug) ?? null;
  const unitLocked = kind === "bar" && (locked != null || selectedGroup != null);
  const shownUnit = locked?.unit ?? selectedGroup?.unit ?? unit;
  const canSave = name.trim().length > 0 && shownUnit.trim().length > 0 && !pending;

  const chooseGroup = (slug: string) => {
    setGroupSlug(slug);
    const group = groups.find((item) => item.slug === slug);
    if (group) setUnit(group.unit);
  };

  const addChip = () => {
    const next = chipDraft.trim();
    if (!next || chips.includes(next) || chips.length >= 8 || next.length > 40) return;
    setChips((current) => [...current, next]);
    setChipDraft("");
  };

  const save = async () => {
    if (!canSave) return;
    setPending(true);
    const result = await submit();
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    toast.success(editingGroup || editingBar ? "Saved" : kind === "group" ? "Group added" : "Bar added");
    onClose();
  };

  const submit = () => {
    if (kind === "group") {
      const input = { name: name.trim(), icon, unit: unit.trim() };
      return editingGroup
        ? onUpdateGroup(editingGroup.slug, input)
        : onCreateGroup(input);
    }
    const input = {
      name: name.trim(),
      icon,
      unit: shownUnit.trim(),
      groupId: locked?.slug ?? (groupSlug === "solo" ? null : groupSlug),
      startDate,
      expectedRule:
        ruleType === "events"
          ? { type: "events" }
          : { type: ruleType, amount, period },
      noteChips: chips,
    };
    return editingBar ? onUpdateBar(editingBar.slug, input) : onCreateBar(input);
  };

  const archive = async () => {
    setPending(true);
    const result = editingGroup
      ? await onUpdateGroup(editingGroup.slug, { archived: true })
      : editingBar
        ? await onUpdateBar(editingBar.slug, { archived: true })
        : { success: false, error: "Nothing to archive" };
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not archive");
      return;
    }
    toast.success("Archived");
    onClose();
  };

  return (
    <TooltipProvider>
      <div className="grid gap-3">
        {mode.mode === "create" && !locked ? (
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={kind === "bar" ? "default" : "outline"} className="h-11" onClick={() => setKind("bar")}>
              Bar
            </Button>
            <Button type="button" variant={kind === "group" ? "default" : "outline"} className="h-11" onClick={() => setKind("group")}>
              Group
            </Button>
          </div>
        ) : null}
        <div className="grid gap-1">
          <Label htmlFor="pace-name">Name</Label>
          <Input id="pace-name" className="h-11" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} />
        </div>
        {editingGroup || editingBar ? (
          <p className="font-pixel text-[10px] text-muted-foreground">
            {editingGroup?.slug ?? editingBar?.slug}
          </p>
        ) : null}
        <div className="grid gap-1">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1">
            {PACE_ICONS.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-pressed={icon === item.id}
                    className={icon === item.id ? "flex h-11 w-11 items-center justify-center border border-primary" : "flex h-11 w-11 items-center justify-center border border-border"}
                    onClick={() => setIcon(item.id)}
                  >
                    <PaceIcon name={item.id} className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="pace-unit">Unit</Label>
          <Input
            id="pace-unit"
            className="h-11"
            value={shownUnit}
            maxLength={16}
            disabled={unitLocked}
            onChange={(event) => setUnit(event.target.value)}
          />
        </div>
        {kind === "bar" ? (
          <>
            {locked ? (
              <p className="text-sm">{locked.name}</p>
            ) : (
              <div className="grid gap-1">
                <Label>Group</Label>
                <Select value={groupSlug} onValueChange={chooseGroup}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.slug}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-1">
              <Label>Start</Label>
              <DatePickerInput
                value={startDate}
                onChange={(event) => {
                  const iso = pickerToIso(event.target.value);
                  if (iso) setStartDate(iso);
                }}
              />
            </div>
            <div className="grid gap-1">
              <Label>Expected grows</Label>
              <Select value={ruleType} onValueChange={(value) => setRuleType(value as typeof ruleType)}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="both">Schedule and events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ruleType !== "events" ? (
              <div className="flex items-center gap-2">
                <div className="flex w-fit items-center border border-border">
                  <Button type="button" variant="ghost" className="h-11 w-11" aria-label="Decrease schedule" disabled={amount <= 1} onClick={() => setAmount((current) => Math.max(1, current - 1))}>
                    −
                  </Button>
                  <span className="font-pixel w-8 text-center">{amount}</span>
                  <Button type="button" variant="ghost" className="h-11 w-11" aria-label="Increase schedule" disabled={amount >= 99} onClick={() => setAmount((current) => Math.min(99, current + 1))}>
                    +
                  </Button>
                </div>
                <Select value={period} onValueChange={(value) => setPeriod(value as PacePeriod)}>
                  <SelectTrigger className="h-11 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">day</SelectItem>
                    <SelectItem value="week">week</SelectItem>
                    <SelectItem value="month">month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="grid gap-1">
              <Label htmlFor="pace-chip">Note chips</Label>
              <div className="flex gap-2">
                <Input
                  id="pace-chip"
                  className="h-11"
                  value={chipDraft}
                  maxLength={40}
                  onChange={(event) => setChipDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addChip();
                    }
                  }}
                />
                <Button type="button" variant="outline" className="h-11" onClick={addChip}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <Button
                    key={chip}
                    type="button"
                    variant="outline"
                    className="h-11"
                    aria-label={`Remove ${chip}`}
                    onClick={() => setChips((current) => current.filter((item) => item !== chip))}
                  >
                    {chip} ×
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : null}
        <Button type="button" className="h-11" disabled={!canSave} onClick={() => void save()}>
          Save
        </Button>
        {editingGroup || editingBar ? (
          <ConfirmDialog
            title={editingGroup ? "Archive group" : "Archive bar"}
            description="It leaves the lists. History stays."
            confirmLabel="Archive"
            confirmVariant="destructive"
            onConfirm={archive}
            trigger={
              <Button type="button" variant="destructive" className="h-11">
                Archive
              </Button>
            }
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
}

function pickerToIso(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
