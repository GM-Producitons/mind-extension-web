import type { PaceBarView, PaceBoard, PaceGroupView } from "../types";

export function findBar(board: PaceBoard, slug: string): PaceBarView | null {
  for (const group of board.groups) {
    const child = group.children.find((bar) => bar.slug === slug);
    if (child) return child;
  }
  return board.solo.find((bar) => bar.slug === slug) ?? null;
}

export function findGroup(board: PaceBoard, slug: string): PaceGroupView | null {
  return board.groups.find((group) => group.slug === slug) ?? null;
}

export function topOwedBars(board: PaceBoard, count = 3): PaceBarView[] {
  return [...board.groups.flatMap((group) => group.children), ...board.solo]
    .sort((a, b) => b.owed - a.owed || a.order - b.order || a.name.localeCompare(b.name))
    .slice(0, count);
}
