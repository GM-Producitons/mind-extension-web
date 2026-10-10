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
  XAxis,
  YAxis,
} from "recharts";
import {
  DUMMY_MISSIONS,
  DUMMY_POSTS,
  DUMMY_TESTOSTERONE,
} from "../lib/constants";
import { MoneyFlow } from "./MoneyFlow";
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

export function TestosteroneMeter() {
  const { kept, committed } = DUMMY_TESTOSTERONE;
  const pct = committed > 0 ? (kept / committed) * 100 : 0;
  return (
    <div className="flex h-full flex-col justify-center gap-1 px-2 py-2">
      <span className="text-[10px] font-medium">Testosterone</span>
      <span className="font-mono text-sm tabular-nums">
        {kept}/{committed}
      </span>
      <div className="h-1.5 w-full overflow-hidden bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const MISSION_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function MissionsRadial({ missions }: { missions: Mission[] }) {
  const shown = missions.length > 0 ? missions : DUMMY_MISSIONS;
  const data = shown.map((m, index) => ({
    name: m.title,
    progress: m.progress,
    fill: MISSION_COLORS[index % MISSION_COLORS.length],
  }));

  return (
    <div className="px-1 py-1">
      <p className="px-1 text-[10px] font-medium">Missions</p>
      <ChartContainer config={radialConfig} className="h-28 w-full">
        <RadialBarChart data={data} innerRadius="20%" outerRadius="90%">
          <RadialBar dataKey="progress" background />
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}

export function MoneySankey() {
  return <MoneyFlow />;
}

export function FlashcardsWidget({
  stats,
}: {
  stats: FlashcardStats | null;
}) {
  if (!stats) {
    return (
      <div className="px-2 py-2 text-[10px] text-muted-foreground">Loading cards…</div>
    );
  }
  const barData = [
    { name: "grades", knew: stats.knewTotal, missed: stats.missedTotal },
  ];

  return (
    <div className="flex h-full flex-col justify-center px-2 py-2">
      <p className="text-[10px] font-medium">Flashcards</p>
      <div className="flex gap-3 font-mono text-sm tabular-nums">
        <div>
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p>{stats.total}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Memorized</p>
          <p>{stats.memorized}</p>
        </div>
      </div>
      <ChartContainer config={flashConfig} className="mt-1 h-8 w-full">
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
    </div>
  );
}

export function PostsAreaChart({ weeks }: { weeks: PostsPerWeek[] }) {
  const shown = weeks.length > 0 ? weeks : DUMMY_POSTS;

  return (
    <div className="px-1 py-1">
      <p className="px-1 text-[10px] font-medium">Posts</p>
      <ChartContainer config={postsConfig} className="h-28 w-full">
        <AreaChart data={shown}>
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
    </div>
  );
}

export function AnalysisCollage({
  missions,
  stats,
  weeks,
}: {
  missions: Mission[];
  stats: FlashcardStats | null;
  weeks: PostsPerWeek[];
}) {
  return (
    <section className="border-b border-border">
      <p className="border-b border-border bg-muted/50 px-3 py-1 text-[11px] font-medium">
        Signals
      </p>
      <div className="grid grid-cols-2">
        <div className="border-r border-b border-border">
          <TestosteroneMeter />
        </div>
        <div className="border-b border-border">
          <FlashcardsWidget stats={stats} />
        </div>
        <div className="border-r border-b border-border">
          <MissionsRadial missions={missions} />
        </div>
        <div className="border-b border-border">
          <PostsAreaChart weeks={weeks} />
        </div>
        <div className="col-span-2">
          <MoneySankey />
        </div>
      </div>
    </section>
  );
}
