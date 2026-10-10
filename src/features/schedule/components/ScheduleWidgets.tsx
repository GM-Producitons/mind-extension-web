"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  RadialBar,
  RadialBarChart,
  Sankey,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DUMMY_MONEY_SANKEY, DUMMY_TESTOSTERONE } from "../lib/constants";
import type { FlashcardStats, PostsPerWeek } from "../lib/schedule-stats.repository";
import type { Mission } from "../types/dayplan";

const radialConfig: ChartConfig = {
  progress: { label: "Progress", color: "var(--chart-2)" },
};

const postsConfig: ChartConfig = {
  count: { label: "Posts", color: "var(--chart-1)" },
};

const flashConfig: ChartConfig = {
  knew: { label: "Knew", color: "var(--chart-1)" },
  missed: { label: "Missed", color: "var(--chart-4)" },
};

const sankeyConfig: ChartConfig = {
  Job: { label: "Job", color: "var(--chart-2)" },
  Allowance: { label: "Allowance", color: "var(--chart-3)" },
  Food: { label: "Food", color: "var(--chart-1)" },
  Benzene: { label: "Benzene", color: "var(--chart-5)" },
};

export function TestosteroneMeter() {
  const { kept, committed } = DUMMY_TESTOSTERONE;
  const pct = committed > 0 ? (kept / committed) * 100 : 0;
  return (
    <section className="flex h-[4.5rem] items-center justify-between border-b border-border px-3">
      <span className="text-xs font-medium">Testosterone</span>
      <span className="font-mono text-sm tabular-nums">
        {kept}/{committed}
      </span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

export function MissionsRadial({ missions }: { missions: Mission[] }) {
  if (missions.length === 0) {
    return (
      <section className="border-b border-border px-3 py-4 text-xs text-muted-foreground">
        No missions in today&apos;s plan.
      </section>
    );
  }
  const data = missions.map((m) => ({
    name: m.title,
    progress: m.progress,
    fill: "var(--color-progress)",
  }));

  return (
    <section className="h-[22rem] border-b border-border px-2 py-2">
      <p className="px-1 text-xs font-medium">Missions</p>
      <ChartContainer config={radialConfig} className="h-[20rem] w-full">
        <RadialBarChart data={data} innerRadius="20%" outerRadius="90%">
          <RadialBar dataKey="progress" background />
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        </RadialBarChart>
      </ChartContainer>
    </section>
  );
}

export function MoneySankey() {
  const data = {
    nodes: DUMMY_MONEY_SANKEY.nodes,
    links: DUMMY_MONEY_SANKEY.links,
  };

  return (
    <section className="h-56 border-b border-border px-2 py-2">
      <p className="px-1 text-xs font-medium">Money flow</p>
      <ChartContainer config={sankeyConfig} className="h-48 w-full">
        <Sankey
          data={data}
          nodePadding={24}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          link={{ stroke: "var(--chart-2)", strokeOpacity: 0.4 }}
        >
          <Tooltip />
        </Sankey>
      </ChartContainer>
    </section>
  );
}

export function FlashcardsWidget({
  stats,
}: {
  stats: FlashcardStats | null;
}) {
  if (!stats) {
    return (
      <section className="border-b border-border px-3 py-4 text-xs text-muted-foreground">
        Loading flashcards…
      </section>
    );
  }
  const barData = [
    { name: "grades", knew: stats.knewTotal, missed: stats.missedTotal },
  ];

  return (
    <section className="border-b border-border px-3 py-3">
      <p className="mb-2 text-xs font-medium">Flashcards</p>
      <div className="flex gap-6 font-mono text-sm tabular-nums">
        <div>
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p>{stats.total}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Memorized</p>
          <p>{stats.memorized}</p>
        </div>
      </div>
      <ChartContainer config={flashConfig} className="mt-2 h-24 w-full">
        <BarChart data={barData} layout="vertical">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="knew" stackId="a" fill="var(--color-knew)" radius={2} />
          <Bar
            dataKey="missed"
            stackId="a"
            fill="var(--color-missed)"
            radius={2}
          />
        </BarChart>
      </ChartContainer>
    </section>
  );
}

export function PostsAreaChart({ weeks }: { weeks: PostsPerWeek[] }) {
  if (weeks.length === 0) {
    return (
      <section className="border-b border-border px-3 py-4 text-xs text-muted-foreground">
        No posts yet.
      </section>
    );
  }

  return (
    <section className="h-40 border-b border-border px-2 py-2">
      <p className="px-1 text-xs font-medium">Posts / week</p>
      <ChartContainer config={postsConfig} className="h-32 w-full">
        <AreaChart data={weeks}>
          <XAxis dataKey="week" tick={{ fontSize: 10 }} />
          <YAxis width={24} tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            fill="var(--color-count)"
            fillOpacity={0.25}
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
