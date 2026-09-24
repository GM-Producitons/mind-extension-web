import mongoose from "mongoose";
import {
  createClusterRecord,
  createFlashcardRecord,
  deleteCardsWithoutClusters,
  deleteClusterRecord,
  findClusterRecordByName,
  getClusterRecord,
  getClusterRecordsByIds,
  getClusterStats,
  gradeFlashcardRecord,
  listClusterRecords,
  listFlashcardRecords,
  pullClusterFromCards,
  renameClusterRecord,
  touchClustersTrained,
} from "../lib/flashcards.repository";
import type {
  ActionResult,
  ClusterRecord,
  CreateFlashcardInput,
  Flashcard,
  FlashcardCluster,
  Grade,
  PracticeDeck,
} from "../types";

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function isId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function withCounts(
  cluster: ClusterRecord,
  stats: Map<string, { cardCount: number; knewCount: number; missedCount: number }>,
): FlashcardCluster {
  const row = stats.get(cluster._id);
  return {
    ...cluster,
    cardCount: row?.cardCount ?? 0,
    knewCount: row?.knewCount ?? 0,
    missedCount: row?.missedCount ?? 0,
  };
}

export async function getClustersService(): Promise<
  ActionResult<FlashcardCluster[]>
> {
  const [clusters, stats] = await Promise.all([
    listClusterRecords(),
    getClusterStats(),
  ]);
  const byId = new Map(stats.map((row) => [row.clusterId, row]));
  return {
    success: true,
    data: clusters.map((cluster) => withCounts(cluster, byId)),
  };
}

export async function createClusterService(
  rawName: string,
): Promise<ActionResult<FlashcardCluster>> {
  const name = normalizeName(rawName);
  if (!name) return { success: false, error: "Name is required" };

  const existing = await findClusterRecordByName(name);
  if (existing) {
    return { success: false, error: "A cluster with that name already exists" };
  }

  const created = await createClusterRecord(name);
  return { success: true, data: withCounts(created, new Map()) };
}

export async function renameClusterService(
  id: string,
  rawName: string,
): Promise<ActionResult<FlashcardCluster>> {
  if (!isId(id)) return { success: false, error: "Cluster was not found" };

  const name = normalizeName(rawName);
  if (!name) return { success: false, error: "Name is required" };

  const duplicate = await findClusterRecordByName(name);
  if (duplicate && duplicate._id !== id) {
    return { success: false, error: "A cluster with that name already exists" };
  }

  const updated = await renameClusterRecord(id, name);
  if (!updated) return { success: false, error: "Cluster was not found" };

  const stats = await getClusterStats();
  const row = stats.find((item) => item.clusterId === id);
  return {
    success: true,
    data: withCounts(updated, row ? new Map([[id, row]]) : new Map()),
  };
}

export async function deleteClusterService(
  id: string,
): Promise<ActionResult<null>> {
  if (!isId(id)) return { success: false, error: "Cluster was not found" };

  const existing = await getClusterRecord(id);
  if (!existing) return { success: false, error: "Cluster was not found" };

  await pullClusterFromCards(id);
  await deleteCardsWithoutClusters();
  await deleteClusterRecord(id);
  return { success: true, data: null };
}

async function resolveClusterIds(input: CreateFlashcardInput) {
  const requestedIds = [...new Set(input.clusterIds.map((id) => id.trim()))].filter(
    Boolean,
  );
  if (requestedIds.some((id) => !isId(id))) {
    return { error: "Cluster was not found" } as const;
  }

  const found = await getClusterRecordsByIds(requestedIds);
  if (found.length !== requestedIds.length) {
    return { error: "Cluster was not found" } as const;
  }

  const byId = new Map(found.map((cluster) => [cluster._id, cluster]));
  const names = input.newClusterNames.map(normalizeName).filter(Boolean);

  for (const name of names) {
    const alreadyChosen = [...byId.values()].some(
      (cluster) => cluster.name.toLowerCase() === name.toLowerCase(),
    );
    if (alreadyChosen) continue;

    const existing = await findClusterRecordByName(name);
    if (existing) {
      byId.set(existing._id, existing);
      continue;
    }

    const created = await createClusterRecord(name);
    byId.set(created._id, created);
  }

  if (byId.size === 0) {
    return { error: "Pick a cluster" } as const;
  }

  return { clusters: [...byId.values()] } as const;
}

export async function createFlashcardService(
  input: CreateFlashcardInput,
): Promise<ActionResult<Flashcard>> {
  const clue = input.clue.trim();
  const hidden = input.hidden.trim();
  if (!clue) return { success: false, error: "Clue is required" };
  if (!hidden) return { success: false, error: "Hidden side is required" };

  const resolved = await resolveClusterIds(input);
  if ("error" in resolved) return { success: false, error: resolved.error };

  const created = await createFlashcardRecord({
    clue,
    hidden,
    clusterIds: resolved.clusters.map((cluster) => cluster._id),
  });

  return {
    success: true,
    data: {
      ...created,
      clusterIds: resolved.clusters.map((cluster) => cluster._id),
      clusters: resolved.clusters.map((cluster) => ({
        _id: cluster._id,
        name: cluster.name,
      })),
    },
  };
}

export async function getPracticeDeckService(
  clusterId?: string,
): Promise<ActionResult<PracticeDeck>> {
  if (clusterId) {
    if (!isId(clusterId)) {
      return { success: false, error: "Cluster was not found" };
    }
    const cluster = await getClusterRecord(clusterId);
    if (!cluster) return { success: false, error: "Cluster was not found" };
    const cards = await listFlashcardRecords(clusterId);
    return { success: true, data: { title: cluster.name, cards } };
  }

  const cards = await listFlashcardRecords();
  return { success: true, data: { title: "All cards", cards } };
}

export async function gradeFlashcardService(
  id: string,
  result: Grade,
): Promise<ActionResult<Flashcard>> {
  if (!isId(id)) return { success: false, error: "Card was not found" };
  if (result !== "knew" && result !== "missed") {
    return { success: false, error: "Grade is required" };
  }

  const at = new Date();
  const card = await gradeFlashcardRecord(id, result, at);
  if (!card) return { success: false, error: "Card was not found" };

  await touchClustersTrained(card.clusterIds, at);
  return { success: true, data: card };
}
