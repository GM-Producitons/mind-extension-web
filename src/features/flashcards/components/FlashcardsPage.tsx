"use client";

import { ConfirmDialog } from "@/features/shared/template/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFlashcardsPage } from "../hooks/use-flashcards-page";
import { ClusterCard } from "./ClusterCard";
import { CreateClusterDialog } from "./CreateClusterDialog";
import { CreateFlashcardDialog } from "./CreateFlashcardDialog";
import { FlashcardsHeader } from "./FlashcardsHeader";

export function FlashcardsPage() {
  const page = useFlashcardsPage();

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-5xl p-4">
        <FlashcardsHeader
          searchQuery={page.searchQuery}
          sort={page.sort}
          onSearchChange={page.setSearchQuery}
          onSortChange={page.setSort}
          onCreateCluster={page.openCreateCluster}
          onCreateCard={page.openCreateCard}
        />

        {page.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading</p>
        ) : page.visibleClusters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {page.hasSearch ? "No matches" : "No clusters"}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.visibleClusters.map((cluster) => (
              <ClusterCard
                key={cluster._id}
                cluster={cluster}
                onRename={() => page.openRename(cluster)}
                onDelete={() => page.openDelete(cluster)}
              />
            ))}
          </div>
        )}

        <CreateClusterDialog
          open={page.createClusterOpen}
          title="New cluster"
          submitLabel="Create"
          nameInputId="new-cluster-name"
          name={page.clusterName}
          isSubmitting={page.isSubmitting}
          onOpenChange={page.setCreateClusterOpen}
          onNameChange={page.setClusterName}
          onSubmit={page.submitCreateCluster}
        />
        <CreateClusterDialog
          open={page.renameOpen}
          title="Rename cluster"
          submitLabel="Save"
          nameInputId="rename-cluster-name"
          name={page.renameName}
          isSubmitting={page.isSubmitting}
          onOpenChange={page.setRenameOpen}
          onNameChange={page.setRenameName}
          onSubmit={page.submitRename}
        />
        <CreateFlashcardDialog
          open={page.cardOpen}
          clusters={page.clusters}
          clue={page.clue}
          hidden={page.hidden}
          selectedClusterIds={page.selectedClusterIds}
          pendingNames={page.pendingNames}
          newClusterName={page.newClusterName}
          isSubmitting={page.isSubmitting}
          onOpenChange={page.setCardOpen}
          onClueChange={page.setClue}
          onHiddenChange={page.setHidden}
          onClusterChecked={page.setClusterChecked}
          onNewClusterNameChange={page.setNewClusterName}
          onAddPending={page.addPendingCluster}
          onRemovePending={page.removePendingCluster}
          onSubmit={page.submitCreateCard}
        />
        <ConfirmDialog
          open={page.deleteTarget != null}
          onOpenChange={(open) => {
            if (!open) page.setDeleteTarget(null);
          }}
          title="Delete cluster"
          description={
            page.deleteTarget
              ? `Delete ${page.deleteTarget.name}? Cards only in this cluster are removed.`
              : "Delete this cluster?"
          }
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={page.confirmDelete}
        />
      </div>
    </TooltipProvider>
  );
}
