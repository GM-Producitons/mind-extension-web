"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import type { PersonGraph } from "../types";

interface PeopleForceGraphProps {
  graph: PersonGraph;
}

export default function PeopleForceGraph({ graph }: PeopleForceGraphProps) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 320, height: 480 });

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => {
      setSize({
        width: node.clientWidth,
        height: Math.max(node.clientHeight, 420),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const foreground =
    typeof window === "undefined"
      ? "#1a1a1a"
      : getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() ||
        "#1a1a1a";
  const link =
    typeof window === "undefined"
      ? "#666666"
      : getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim() ||
        "#666666";

  return (
    <div ref={wrapRef} className="h-[70vh] w-full">
      <ForceGraph2D
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graph}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={5}
        linkColor={() => link}
        nodeColor={() => foreground}
        onNodeClick={(node) => {
          if (node.id != null) router.push(`/people/${String(node.id)}`);
        }}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = String(node.name ?? "");
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = foreground;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label, (node.x ?? 0) + 8, node.y ?? 0);
        }}
      />
    </div>
  );
}
