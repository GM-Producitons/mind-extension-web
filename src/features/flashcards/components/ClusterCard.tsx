"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClusterCardModel } from "../hooks/use-flashcards-page";

interface ClusterCardProps {
  cluster: ClusterCardModel;
  onRename: () => void;
  onDelete: () => void;
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ClusterCard({ cluster, onRename, onDelete }: ClusterCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 truncate text-sm font-medium">{cluster.name}</h2>
        <div className="flex shrink-0 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Rename"
                onClick={onRename}
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rename</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete"
                onClick={onDelete}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {countLabel(cluster.cardCount, "card", "cards")}
        {" · "}
        {cluster.knewCount} knew
        {" · "}
        {cluster.missedCount} missed
      </p>
      <p className="text-xs text-muted-foreground">{cluster.lastTrainedLabel}</p>
      <Button size="sm" className="mt-1 w-full" asChild>
        <Link href={`/flashcards/practice/${cluster._id}`}>Practice</Link>
      </Button>
    </article>
  );
}
