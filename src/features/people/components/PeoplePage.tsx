"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PageHeader } from "@/features/shared/template/page-header";
import { usePeopleGraph } from "../hooks/use-people-graph";
import { CreatePersonDrawer } from "./CreatePersonDrawer";

const PeopleForceGraph = dynamic(() => import("./PeopleForceGraph"), {
  ssr: false,
});

export function PeoplePage() {
  const { graph, isLoading, error, reload } = usePeopleGraph();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      <PageHeader
        title="People"
        size="sm"
        className="px-3"
        actions={[{ label: "Add", onClick: () => setCreateOpen(true) }]}
      />
      {isLoading ? (
        <p className="px-3 text-xs text-muted-foreground">Loading</p>
      ) : error ? (
        <p className="px-3 text-xs text-destructive">{error}</p>
      ) : graph.nodes.length === 0 ? (
        <p className="px-3 text-xs text-muted-foreground">No people</p>
      ) : (
        <PeopleForceGraph graph={graph} />
      )}
      <CreatePersonDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void reload()}
      />
    </main>
  );
}
