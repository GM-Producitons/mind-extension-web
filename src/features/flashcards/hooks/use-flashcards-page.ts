"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  createClusterAction,
  createFlashcardAction,
  deleteClusterAction,
  getClustersAction,
  renameClusterAction,
} from "../actions/flashcards.actions";
import type { ClusterSort, FlashcardCluster } from "../types";

export interface ClusterCardModel extends FlashcardCluster {
  lastTrainedLabel: string;
}

function formatLastTrained(value: string | null) {
  if (!value) return "Not trained";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not trained";
  return `Last trained ${formatDistanceToNow(date, { addSuffix: true })}`;
}

function timeValue(value: string | null) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function compareClusters(sort: ClusterSort, a: FlashcardCluster, b: FlashcardCluster) {
  if (sort === "name") return a.name.localeCompare(b.name);
  if (sort === "size") return b.cardCount - a.cardCount;
  if (sort === "lastTrained") {
    const aTime = timeValue(a.lastTrainedAt);
    const bTime = timeValue(b.lastTrainedAt);
    if (aTime == null && bTime == null) return 0;
    if (aTime == null) return 1;
    if (bTime == null) return -1;
    return bTime - aTime;
  }
  const aCreated = timeValue(a.createdAt) ?? 0;
  const bCreated = timeValue(b.createdAt) ?? 0;
  return bCreated - aCreated;
}

export function useFlashcardsPage() {
  const [clusters, setClusters] = useState<FlashcardCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<ClusterSort>("newest");

  const [createClusterOpen, setCreateClusterOpen] = useState(false);
  const [clusterName, setClusterName] = useState("");

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<FlashcardCluster | null>(null);

  const [cardOpen, setCardOpen] = useState(false);
  const [clue, setClue] = useState("");
  const [hidden, setHidden] = useState("");
  const [selectedClusterIds, setSelectedClusterIds] = useState<string[]>([]);
  const [pendingNames, setPendingNames] = useState<string[]>([]);
  const [newClusterName, setNewClusterName] = useState("");

  const reload = useCallback(async () => {
    const result = await getClustersAction();
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Could not load clusters");
      return;
    }
    setClusters(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void getClustersAction().then((result) => {
      if (cancelled) return;
      if (result.success && result.data) setClusters(result.data);
      else toast.error(result.error ?? "Could not load clusters");
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleClusters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? clusters.filter((cluster) => cluster.name.toLowerCase().includes(query))
      : clusters;
    return [...filtered]
      .sort((a, b) => compareClusters(sort, a, b))
      .map((cluster) => ({
        ...cluster,
        lastTrainedLabel: formatLastTrained(cluster.lastTrainedAt),
      }));
  }, [clusters, searchQuery, sort]);

  const openCreateCluster = () => {
    setClusterName("");
    setCreateClusterOpen(true);
  };

  const submitCreateCluster = async () => {
    setIsSubmitting(true);
    const result = await createClusterAction(clusterName);
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not create cluster");
      return;
    }
    toast.success("Cluster created");
    setCreateClusterOpen(false);
    setClusterName("");
    await reload();
  };

  const openRename = (cluster: FlashcardCluster) => {
    setRenameId(cluster._id);
    setRenameName(cluster.name);
  };

  const submitRename = async () => {
    if (!renameId) return;
    setIsSubmitting(true);
    const result = await renameClusterAction(renameId, renameName);
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not rename cluster");
      return;
    }
    toast.success("Cluster renamed");
    setRenameId(null);
    setRenameName("");
    await reload();
  };

  const openDelete = (cluster: FlashcardCluster) => {
    setDeleteTarget(cluster);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteClusterAction(deleteTarget._id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete cluster");
      return;
    }
    toast.success("Cluster deleted");
    setDeleteTarget(null);
    await reload();
  };

  const openCreateCard = () => {
    setClue("");
    setHidden("");
    setSelectedClusterIds([]);
    setPendingNames([]);
    setNewClusterName("");
    setCardOpen(true);
  };

  const setClusterChecked = (id: string, checked: boolean) => {
    setSelectedClusterIds((current) => {
      if (checked) return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  const addPendingCluster = () => {
    const name = newClusterName.trim().replace(/\s+/g, " ");
    if (!name) return;
    const existing = clusters.find(
      (cluster) => cluster.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      setSelectedClusterIds((current) =>
        current.includes(existing._id) ? current : [...current, existing._id],
      );
      setNewClusterName("");
      return;
    }
    setPendingNames((current) =>
      current.some((item) => item.toLowerCase() === name.toLowerCase())
        ? current
        : [...current, name],
    );
    setNewClusterName("");
  };

  const removePendingCluster = (name: string) => {
    setPendingNames((current) => current.filter((item) => item !== name));
  };

  const submitCreateCard = async () => {
    setIsSubmitting(true);
    const result = await createFlashcardAction({
      clue,
      hidden,
      clusterIds: selectedClusterIds,
      newClusterNames: pendingNames,
    });
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not add card");
      return;
    }
    toast.success("Card added");
    setCardOpen(false);
    await reload();
  };

  return {
    clusters,
    visibleClusters,
    isLoading,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    hasSearch: searchQuery.trim().length > 0,
    createClusterOpen,
    setCreateClusterOpen,
    clusterName,
    setClusterName,
    openCreateCluster,
    submitCreateCluster,
    renameOpen: renameId != null,
    setRenameOpen: (open: boolean) => {
      if (!open) {
        setRenameId(null);
        setRenameName("");
      }
    },
    renameName,
    setRenameName,
    openRename,
    submitRename,
    deleteTarget,
    setDeleteTarget,
    openDelete,
    confirmDelete,
    cardOpen,
    setCardOpen,
    clue,
    setClue,
    hidden,
    setHidden,
    selectedClusterIds,
    pendingNames,
    newClusterName,
    setNewClusterName,
    openCreateCard,
    setClusterChecked,
    addPendingCluster,
    removePendingCluster,
    submitCreateCard,
  };
}
