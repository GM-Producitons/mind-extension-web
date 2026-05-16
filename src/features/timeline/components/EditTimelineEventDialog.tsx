"use client";

import { useState, useTransition, useEffect } from "react";
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
import {
  deleteTimelineEvent,
  updateTimelineEvent,
} from "@/features/timeline/apis/actions";
import type { TimelineEvent } from "@/features/timeline/models/timeline_event";

interface EditTimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
  onSaved: (event: TimelineEvent) => void;
  onDeleted: (id: string) => void;
}

export default function EditTimelineEventDialog({
  open,
  onOpenChange,
  event,
  onSaved,
  onDeleted,
}: EditTimelineEventDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [days, setDays] = useState("7");
  const [color, setColor] = useState("#7c3aed");
  const [type, setType] = useState<"sprint" | "marathon" | "">("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDays(String(event.days));
      setColor(event.color);
      setType(event.type ?? "");
      setStart(event.start.toISOString().slice(0, 10));
    }
  }, [event]);

  const handleSave = () => {
    if (!event?._id) return;

    startTransition(async () => {
      const result = await updateTimelineEvent({
        eventId: event._id!,
        title,
        start,
        days: Number(days),
        color,
        type: type || undefined,
      });

      if (!result.success || !result.event) {
        console.error(result.error ?? "Failed to update timeline event");
        return;
      }

      onSaved({ ...result.event, start: new Date(result.event.start) });
      onOpenChange(false);
    });
  };

  const handleDelete = () => {
    if (!event?._id) return;

    startTransition(async () => {
      const result = await deleteTimelineEvent(event._id!);

      if (!result.success) {
        console.error(result.error ?? "Failed to delete timeline event");
        return;
      }

      onDeleted(event._id!);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit timeline event</DialogTitle>
          <DialogDescription>
            Update the selected timeline event or delete it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-timeline-title">Title</Label>
            <Input
              id="edit-timeline-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-timeline-start">Start</Label>
              <Input
                id="edit-timeline-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-timeline-days">Days</Label>
              <Input
                id="edit-timeline-days"
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-timeline-color">Color</Label>
              <Input
                id="edit-timeline-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full p-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-timeline-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as typeof type)}
            >
              <SelectTrigger id="edit-timeline-type" className="w-full">
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
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !event?._id}
            type="button"
          >
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isPending || !event?._id || !title.trim() || !start || !days
            }
            type="button"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
