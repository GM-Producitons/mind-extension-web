"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTimelineEvent } from "@/features/timeline/apis/actions";
import type { TimelineEvent } from "@/features/timeline/models/timeline_event";

interface AddTimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (event: TimelineEvent) => void;
}

export default function AddTimelineEventDialog({
  open,
  onOpenChange,
  onCreated,
}: AddTimelineEventDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [days, setDays] = useState("7");
  const [color, setColor] = useState("#7c3aed");
  const [type, setType] = useState<"sprint" | "marathon" | "">("");

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createTimelineEvent({
        title,
        start,
        days: Number(days),
        color,
        type: type || undefined,
      });

      if (!result.success || !result.event) {
        console.error(result.error ?? "Failed to create timeline event");
        return;
      }

      onCreated({ ...result.event, start: new Date(result.event.start) });
      onOpenChange(false);
      setTitle("");
      setStart("");
      setDays("7");
      setColor("#7c3aed");
      setType("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add timeline event</DialogTitle>
          <DialogDescription>
            Create a sprint or marathon and send it straight into the final
            timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="add-timeline-title">Title</Label>
            <Input
              id="add-timeline-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Read a book, run a sprint, finish a marathon"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="add-timeline-start">Start</Label>
              <Input
                id="add-timeline-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-timeline-days">Days</Label>
              <Input
                id="add-timeline-days"
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-timeline-color">Color</Label>
              <Input
                id="add-timeline-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full p-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-timeline-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as typeof type)}
            >
              <SelectTrigger id="add-timeline-type" className="w-full">
                <SelectValue placeholder="Auto-detect from days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sprint">Sprint</SelectItem>
                <SelectItem value="marathon">Marathon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending || !title.trim() || !start || !days}
            type="button"
          >
            {isPending ? "Creating..." : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
