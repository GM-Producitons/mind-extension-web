"use client";

import { useLayoutEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ACTIVITY_STATE_ICONS } from "../lib/activity-state-visual";
import {
  STATUS_TOTAL_LABELS,
  STORED_ACTIVITY_STATES,
  type StoredActivityState,
} from "../lib/activity-states";
import {
  readActivityToken,
  useActivityColors,
} from "../lib/activity-color-store";

function ColorRow({ state }: { state: StoredActivityState }) {
  const override = useActivityColors((store) => store.overrides[state]);
  const setColor = useActivityColors((store) => store.setColor);
  const clearColor = useActivityColors((store) => store.clearColor);
  const [token, setToken] = useState<string | null>(null);
  const Icon = ACTIVITY_STATE_ICONS[state];
  const label = STATUS_TOTAL_LABELS[state];

  useLayoutEffect(() => {
    setToken(readActivityToken(state));
  }, [state]);

  return (
    <div className="flex items-center gap-2 py-1">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
      {override ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => clearColor(state)}
        >
          Reset
        </Button>
      ) : null}
      <input
        type="color"
        aria-label={`${label} color`}
        value={override ?? token ?? "#64748b"}
        onChange={(event) => setColor(state, event.target.value)}
        className="size-8 cursor-pointer border border-border bg-transparent p-0.5"
      />
    </div>
  );
}

function ColorList() {
  return (
    <div className="grid">
      {STORED_ACTIVITY_STATES.map((state) => (
        <ColorRow key={state} state={state} />
      ))}
    </div>
  );
}

export function ActivityColorsButton() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const reset = useActivityColors((store) => store.reset);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Activity colors"
            onClick={() => setOpen(true)}
          >
            <Settings />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Colors</TooltipContent>
      </Tooltip>
      {open && isMobile ? (
        <Drawer open={open} onOpenChange={setOpen} direction="bottom">
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Colors</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4">
              <ColorList />
            </div>
            <DrawerFooter>
              <Button type="button" variant="outline" onClick={reset}>
                Reset
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : null}
      {open && !isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Colors</DialogTitle>
            </DialogHeader>
            <ColorList />
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
          </DialogContent>
        </Dialog>
      ) : null}
    </TooltipProvider>
  );
}
