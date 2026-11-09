"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PaceBarView, PaceGroupView } from "../types";
import { PaceBoxes, PaceStatusTag } from "./PaceBoxes";

function useRowPress(onLongPress: () => void) {
  const timer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const clear = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return {
    onPointerDown: (event: PointerEvent) => {
      fired.current = false;
      origin.current = { x: event.clientX, y: event.clientY };
      clear();
      timer.current = window.setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, 500);
    },
    onPointerMove: (event: PointerEvent) => {
      if (!origin.current) return;
      const dx = event.clientX - origin.current.x;
      const dy = event.clientY - origin.current.y;
      if (dx * dx + dy * dy > 16) clear();
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (event: MouseEvent) => {
      event.preventDefault();
      fired.current = true;
      onLongPress();
    },
    onClick: (event: MouseEvent, open: () => void) => {
      if (fired.current) {
        event.preventDefault();
        fired.current = false;
        return;
      }
      open();
    },
  };
}

export function PaceBarRow({
  bar,
  onOpen,
}: {
  bar: PaceBarView;
  onOpen: (focusNote: boolean) => void;
}) {
  const press = useRowPress(() => onOpen(true));
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-1 border-b border-border px-3 py-2 text-left"
      onPointerDown={press.onPointerDown}
      onPointerMove={press.onPointerMove}
      onPointerUp={press.onPointerUp}
      onPointerLeave={press.onPointerLeave}
      onPointerCancel={press.onPointerCancel}
      onContextMenu={press.onContextMenu}
      onClick={(event) => press.onClick(event, () => onOpen(false))}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">
          {bar.name}{" "}
          <span className="font-pixel text-xs font-normal">
            {bar.done}/{bar.expected}
          </span>
        </span>
        <PaceStatusTag status={bar.status} owed={bar.owed} />
      </span>
      <PaceBoxes
        icon={bar.icon}
        done={bar.done}
        owed={bar.owed}
        recentDone={bar.recentDone}
        recentExpected={bar.recentExpected}
        size={12}
      />
    </button>
  );
}

export function PaceGroupRow({ group }: { group: PaceGroupView }) {
  return (
    <Link href={`/pace/${group.slug}`} className="block border-b border-border px-3 py-3">
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-base font-bold">
            {group.name}{" "}
            <span className="font-pixel text-xs font-normal text-muted-foreground">
              x{group.childCount}
            </span>{" "}
            <span className="font-pixel text-xs font-normal">
              {group.done}/{group.expected}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <PaceStatusTag status={group.status} owed={group.owed} />
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </span>
      </span>
      <span className="mt-2 block border-2 border-pace-frame p-1">
        <PaceBoxes
          icon={group.icon}
          done={group.done}
          owed={group.owed}
          recentDone={group.recentDone}
          recentExpected={group.recentExpected}
          size={12}
        />
      </span>
    </Link>
  );
}
