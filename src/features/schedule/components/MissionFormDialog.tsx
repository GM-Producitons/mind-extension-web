"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Mission } from "../types";
import type { MissionFormData } from "../hooks/use-missions";

const PRIORITY_OPTIONS = [
  {
    value: 1,
    label: "P1 – Critical",
    color: "text-green-600 dark:text-green-400",
  },
  { value: 2, label: "P2 – High", color: "text-lime-600 dark:text-lime-400" },
  {
    value: 3,
    label: "P3 – Medium",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    value: 4,
    label: "P4 – Low",
    color: "text-orange-600 dark:text-orange-400",
  },
  { value: 5, label: "P5 – Minimal", color: "text-red-600 dark:text-red-400" },
];

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission?: Mission;
  onSubmit: (data: MissionFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function MissionFormDialog({
  open,
  onOpenChange,
  mission,
  onSubmit,
  isSubmitting,
}: Props) {
  const isEdit = !!mission;

  const [name, setName] = useState("");
  const [priority, setPriority] = useState(3);
  const [deadlineStr, setDeadlineStr] = useState("");

  useEffect(() => {
    if (open) {
      setName(mission?.name ?? "");
      setPriority(mission?.priority ?? 3);
      setDeadlineStr(
        mission ? toDateInputValue(new Date(mission.deadline)) : "",
      );
    }
  }, [open, mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !deadlineStr) return;
    await onSubmit({
      name: name.trim(),
      priority,
      deadline: new Date(deadlineStr),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Mission" : "New Mission"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mission-name">Name</Label>
            <Input
              id="mission-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mission name"
              required
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mission-priority">Priority</Label>
            <select
              id="mission-priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mission-deadline">Deadline</Label>
            <Input
              id="mission-deadline"
              type="date"
              value={deadlineStr}
              onChange={(e) => setDeadlineStr(e.target.value)}
              required
            />
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save Changes"
                  : "Add Mission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
