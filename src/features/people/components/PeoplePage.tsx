"use client";

import dynamic from "next/dynamic";
import { PeopleSkeleton } from "@/features/shared/template/page-skeletons";
import { usePeopleGraph } from "../hooks/use-people-graph";

const PeopleForceGraph = dynamic(() => import("./PeopleForceGraph"), {
  ssr: false,
  loading: () => <PeopleSkeleton />,
});

export function PeoplePage() {
  const { graph, isLoading, error } = usePeopleGraph();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      {isLoading ? (
        <PeopleSkeleton />
      ) : error ? (
        <p className="px-3 text-xs text-destructive">{error}</p>
      ) : graph.nodes.length === 0 ? (
        <p className="px-3 text-xs text-muted-foreground">No people</p>
      ) : (
        <PeopleForceGraph graph={graph} />
      )}
    </main>
  );
}
