import type { CSSProperties } from "react";

/** Stored colors are #rrggbb. Unset resolves to the pace token. */
export const PACE_COLORS = [
  { id: "orange", label: "Orange", value: "#f5841f" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
  { id: "blue", label: "Blue", value: "#3b82f6" },
  { id: "cyan", label: "Cyan", value: "#22d3ee" },
  { id: "green", label: "Green", value: "#10b981" },
  { id: "lime", label: "Lime", value: "#84cc16" },
  { id: "pink", label: "Pink", value: "#ec4899" },
  { id: "amber", label: "Amber", value: "#f59e0b" },
] as const;

export const DEFAULT_PACE_COLOR_HEX = PACE_COLORS[0].value;
export const DEFAULT_PACE_COLOR = "var(--pace-done)";

const PACE_HEX = /^#[0-9a-f]{6}$/;

export function isPaceHex(value: string): boolean {
  return PACE_HEX.test(value);
}

/** A bar color wins. Otherwise the group color. Otherwise the orange token. */
export function resolvePaceColor(
  own: string | null | undefined,
  parent?: string | null,
): string {
  if (own && PACE_HEX.test(own)) return own;
  if (parent && PACE_HEX.test(parent)) return parent;
  return DEFAULT_PACE_COLOR;
}

export function pacePaint(color: string): string {
  if (color === DEFAULT_PACE_COLOR || PACE_HEX.test(color)) return color;
  return DEFAULT_PACE_COLOR;
}

export function paceDoneStyle(color: string, size: number): CSSProperties {
  const paint = pacePaint(color);
  return {
    width: size,
    height: size,
    background: paint,
    boxShadow: `inset 2px 2px 0 color-mix(in srgb, ${paint} 62%, white), inset -2px -2px 0 color-mix(in srgb, ${paint} 68%, black)`,
  };
}
