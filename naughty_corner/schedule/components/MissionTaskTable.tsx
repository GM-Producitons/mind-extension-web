"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTasksByMissionIdAction } from "../apis/task.actions";
import type { ScheduleTask } from "../types";

interface MissionTaskTableProps {
  missionId: string;
}

export function MissionTaskTable({ missionId }: MissionTaskTableProps) {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getTasksByMissionIdAction(missionId).then((result) => {
      if (cancelled) return;
      if (result.success) setTasks(result.tasks);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [missionId]);

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Loading tasks…
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No tasks yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Completion Factor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task._id}>
            <TableCell>{task.title}</TableCell>
            <TableCell className="capitalize">{task.type ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {task.completionFactor != null
                ? `${task.completionFactor > 0 ? "+" : ""}${task.completionFactor}%`
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
