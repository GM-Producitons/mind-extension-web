"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateClusterDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  nameInputId: string;
  name: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function CreateClusterDialog({
  open,
  title,
  submitLabel,
  nameInputId,
  name,
  isSubmitting,
  onOpenChange,
  onNameChange,
  onSubmit,
}: CreateClusterDialogProps) {
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor={nameInputId}>Name</Label>
            <Input
              id={nameInputId}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
