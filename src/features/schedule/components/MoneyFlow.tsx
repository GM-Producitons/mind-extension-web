"use client";

import { DUMMY_MONEY_SANKEY } from "../lib/constants";

const SOURCE_COLORS = ["var(--chart-2)", "var(--chart-4)"];
const TARGET_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-5)"];

interface FlowNode {
  name: string;
  value: number;
  color: string;
  y: number;
  h: number;
}

function money(value: number) {
  return value.toLocaleString("en-US");
}

function layout() {
  const { nodes, links } = DUMMY_MONEY_SANKEY;
  const sourceCount = 2;
  const sources = nodes.slice(0, sourceCount).map((node, index) => {
    const value = links
      .filter((link) => link.source === index)
      .reduce((sum, link) => sum + link.value, 0);
    return { name: node.name, value, color: SOURCE_COLORS[index] ?? "var(--chart-2)" };
  });
  const targets = nodes.slice(sourceCount).map((node, index) => {
    const nodeIndex = index + sourceCount;
    const value = links
      .filter((link) => link.target === nodeIndex)
      .reduce((sum, link) => sum + link.value, 0);
    return {
      name: node.name,
      value,
      color: TARGET_COLORS[index] ?? "var(--chart-5)",
    };
  });

  const height = 220;
  const gap = 14;
  const place = (
    rows: { name: string; value: number; color: string }[],
  ): FlowNode[] => {
    const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
    const usable = height - gap * (rows.length - 1);
    let y = 0;
    return rows.map((row) => {
      const h = Math.max(18, (row.value / total) * usable);
      const placed = { ...row, y, h };
      y += h + gap;
      return placed;
    });
  };

  const left = place(sources);
  const right = place(targets);

  const sourceCursor = left.map((node) => node.y);
  const targetCursor = right.map((node) => node.y);
  const ribbons = links.map((link, index) => {
    const source = left[link.source];
    const target = right[link.target - sourceCount];
    const sourceShare = source.h * (link.value / source.value);
    const targetShare = target.h * (link.value / target.value);
    const y0 = sourceCursor[link.source];
    const y1 = targetCursor[link.target - sourceCount];
    sourceCursor[link.source] += sourceShare;
    targetCursor[link.target - sourceCount] += targetShare;
    return {
      key: index,
      y0,
      y1,
      h0: sourceShare,
      h1: targetShare,
      from: source.color,
      to: target.color,
    };
  });

  const total = sources.reduce((sum, node) => sum + node.value, 0);
  return { left, right, ribbons, total, height };
}

export function MoneyFlow() {
  const { left, right, ribbons, total, height } = layout();
  const barX = 108;
  const barW = 7;
  const rightBarX = 360;
  const mid = 234;

  return (
    <div className="px-2 py-2">
      <p className="text-[10px] font-medium">Money</p>
      <svg
        viewBox={`0 0 470 ${height + 8}`}
        className="mt-1 h-36 w-full"
        role="img"
        aria-label="Money flow"
      >
        <defs>
          {ribbons.map((ribbon) => (
            <linearGradient
              key={ribbon.key}
              id={`flow-${ribbon.key}`}
              x1="0"
              x2="1"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor={ribbon.from} stopOpacity="0.55" />
              <stop offset="100%" stopColor={ribbon.to} stopOpacity="0.45" />
            </linearGradient>
          ))}
        </defs>

        {ribbons.map((ribbon) => {
          const x0 = barX + barW;
          const x1 = rightBarX;
          const c = (x1 - x0) * 0.55;
          const d = [
            `M ${x0} ${ribbon.y0}`,
            `C ${x0 + c} ${ribbon.y0}, ${x1 - c} ${ribbon.y1}, ${x1} ${ribbon.y1}`,
            `L ${x1} ${ribbon.y1 + ribbon.h1}`,
            `C ${x1 - c} ${ribbon.y1 + ribbon.h1}, ${x0 + c} ${ribbon.y0 + ribbon.h0}, ${x0} ${ribbon.y0 + ribbon.h0}`,
            "Z",
          ].join(" ");
          return <path key={ribbon.key} d={d} fill={`url(#flow-${ribbon.key})`} />;
        })}

        {left.map((node) => (
          <g key={node.name}>
            <text
              x={barX - 10}
              y={node.y + node.h / 2 - 2}
              textAnchor="end"
              fill="var(--foreground)"
              fontSize="12"
            >
              {node.name}
            </text>
            <text
              x={barX - 10}
              y={node.y + node.h / 2 + 12}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              {money(node.value)}
            </text>
            <rect
              x={barX}
              y={node.y}
              width={barW}
              height={node.h}
              rx={3}
              fill={node.color}
            />
          </g>
        ))}

        {right.map((node) => (
          <g key={node.name}>
            <rect
              x={rightBarX}
              y={node.y}
              width={barW}
              height={node.h}
              rx={3}
              fill={node.color}
            />
            <text
              x={rightBarX + barW + 10}
              y={node.y + node.h / 2 - 2}
              fill="var(--foreground)"
              fontSize="12"
            >
              {node.name}
            </text>
            <text
              x={rightBarX + barW + 10}
              y={node.y + node.h / 2 + 12}
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              {money(node.value)}
            </text>
          </g>
        ))}

        <text
          x={mid}
          y={height / 2 - 18}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="12"
        >
          Spent
        </text>
        <text
          x={mid}
          y={height / 2 + 10}
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="28"
          fontWeight="600"
        >
          {money(total)}
        </text>
        <text
          x={mid}
          y={height / 2 + 28}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="11"
        >
          {left.length} sources · {ribbons.length} routes
        </text>
      </svg>
    </div>
  );
}
