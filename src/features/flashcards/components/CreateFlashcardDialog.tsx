"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FlashcardCluster } from "../types";

interface CreateFlashcardDialogProps {
  open: boolean;
  clusters: FlashcardCluster[];
  clue: string;
  hidden: string;
  selectedClusterIds: string[];
  pendingNames: string[];
  newClusterName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onClueChange: (value: string) => void;
  onHiddenChange: (value: string) => void;
  onClusterChecked: (id: string, checked: boolean) => void;
  onNewClusterNameChange: (value: string) => void;
  onAddPending: () => void;
  onRemovePending: (name: string) => void;
  onSubmit: () => void;
}

export function CreateFlashcardDialog({
  open,
  clusters,
  clue,
  hidden,
  selectedClusterIds,
  pendingNames,
  newClusterName,
  isSubmitting,
  onOpenChange,
  onClueChange,
  onHiddenChange,
  onClusterChecked,
  onNewClusterNameChange,
  onAddPending,
  onRemovePending,
  onSubmit,
}: CreateFlashcardDialogProps) {
  const canSubmit =
    !isSubmitting &&
    clue.trim().length > 0 &&
    hidden.trim().length > 0 &&
    (selectedClusterIds.length > 0 || pendingNames.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="card-clue">Clue</Label>
            <Textarea
              id="card-clue"
              value={clue}
              onChange={(event) => onClueChange(event.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="card-hidden">Hidden</Label>
            <Textarea
              id="card-hidden"
              value={hidden}
              onChange={(event) => onHiddenChange(event.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Clusters</Label>
            {pendingNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pendingNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs"
                  >
                    {name}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Remove ${name}`}
                          onClick={() => onRemovePending(name)}
                        >
                          <X className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Remove</TooltipContent>
                    </Tooltip>
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-40 overflow-auto rounded-md border px-2">
              {clusters.length === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">No clusters yet</p>
              ) : (
                clusters.map((cluster) => (
                  <label
                    key={cluster._id}
                    className="flex items-center gap-2 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={selectedClusterIds.includes(cluster._id)}
                      onCheckedChange={(checked) =>
                        onClusterChecked(cluster._id, checked === true)
                      }
                    />
                    <span className="truncate">{cluster.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newClusterName}
                onChange={(event) => onNewClusterNameChange(event.target.value)}
                placeholder="New cluster"
                aria-label="New cluster"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddPending();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={onAddPending}
                disabled={newClusterName.trim().length === 0}
              >
                Add
              </Button>
            </div>
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
              Add card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
