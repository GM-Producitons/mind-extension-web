"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Block } from "../types/dayplan";
import { resolveBlockRef } from "../lib/dayplan-utils";
import type { DayPlan } from "../types/dayplan";

interface BlockDetailDrawerProps {
  plan: DayPlan | null;
  block: Block | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockDetailDrawer({
  plan,
  block,
  open,
  onOpenChange,
}: BlockDetailDrawerProps) {
  const resolved = plan && block ? resolveBlockRef(plan, block) : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="max-h-[85vh]">
        {block && (
          <>
            <DrawerHeader>
              <DrawerTitle className="text-left">{block.title}</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-3 px-4 pb-6 text-sm">
              <p className="font-mono text-muted-foreground">
                {block.start} – {block.end} · {block.type} · drain {block.drain}
              </p>
              {block.note ? (
                <p className="text-foreground">{block.note}</p>
              ) : null}
              {resolved ? (
                <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
                  {JSON.stringify(resolved, null, 2)}
                </pre>
              ) : null}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
