"use client";
import { useCallback, useState } from "react";
import { Edit2, MoreHorizontal, Skull, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateMissionCompletionRateAction } from "../apis/task.actions";
import { MissionProgressBar } from "./MissionProgressBar";
import { MissionTaskTable } from "./MissionTaskTable";
import type { Mission } from "../types";
import { cn } from "@/lib/utils";

function formatDeadline(date: Date | string) {
  const d = new Date(date);
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function priorityBadgeClass(p: number) {
  switch (p) {
    case 1:
      return "bg-green-500/15 text-green-600 dark:text-green-400";
    case 2:
      return "bg-lime-500/15 text-lime-600 dark:text-lime-400";
    case 3:
      return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
    case 4:
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    case 5:
      return "bg-red-500/15 text-red-600 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface MissionCardProps extends Mission {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function Mission({
  onEdit,
  onDelete,
  ...mission
}: MissionCardProps) {
  const [completionRate, setCompletionRate] = useState(
    mission.completionRate ?? 0,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCompletionRateCommit = useCallback(
    async (newRate: number) => {
      setCompletionRate(newRate);
      await updateMissionCompletionRateAction(mission._id, newRate);
    },
    [mission._id],
  );

  return (
    <Card>
      {/** Mission name + priority badge + 3-dot menu */}
      <CardHeader className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{mission.name}</p>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-bold tabular-nums",
              priorityBadgeClass(mission.priority),
            )}
          >
            P{mission.priority}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-36 p-1">
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                onClick={onEdit}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/** Row 1: Progress bar + deadline */}
        <div className="flex items-center justify-between gap-4">
          <MissionProgressBar
            value={completionRate}
            onValueCommit={handleCompletionRateCommit}
            className="flex-2"
          />
          <div className="flex shrink-0 items-center gap-1 flex-1 justify-end">
            <span className="text-sm tabular-nums">
              {formatDeadline(mission.deadline)}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="h-8 w-0.5 bg-black" />
            <Skull className="h-4 w-4 text-muted-foreground" color="red" />
          </div>
        </div>

        {/** Row 2: Tasks table */}
        <MissionTaskTable missionId={mission._id} />
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mission?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{mission.name}&rdquo; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setDeleteOpen(false);
                onDelete?.();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
