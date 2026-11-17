"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameFolderDialogProps {
  open: boolean;
  name: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function RenameFolderDialog({
  open,
  name,
  isSubmitting,
  onOpenChange,
  onNameChange,
  onSubmit,
}: RenameFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Folder name</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          autoFocus
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
