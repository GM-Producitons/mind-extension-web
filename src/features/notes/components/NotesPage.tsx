"use client";

import { ConfirmDialog } from "@/features/shared/template/confirm-dialog";
import { PageHeader } from "@/features/shared/template/page-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotesPage } from "../hooks/use-notes-page";
import { NotesSidebar } from "./NotesSidebar";
import { NoteEditorPane } from "./NoteEditorPane";
import { RenameFolderDialog } from "./RenameFolderDialog";

export function NotesPage() {
  const page = useNotesPage();
  const isMobile = useIsMobile();

  const showList = !isMobile || !page.selectedNote;
  const showEditor = !isMobile || Boolean(page.selectedNote);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        {showList && (
          <div className="shrink-0 border-b border-border px-4 py-3 md:hidden">
            <PageHeader title="Notes" size="sm" className="mb-0" />
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {showList && (
            <NotesSidebar
              folderTree={page.folderTree}
              rootNotes={page.rootNotes}
              selectedNoteId={page.selectedNoteId}
              activeFolderId={page.activeFolderId}
              expandedFolderIds={page.expandedFolderIds}
              searchQuery={page.searchQuery}
              isLoading={page.isLoading}
              onSearchChange={page.setSearchQuery}
              onCreateNote={() => void page.createNote()}
              onCreateFolder={() => void page.createFolder()}
              onSelectNote={page.selectNote}
              onDeleteNote={page.setDeleteNoteTarget}
              onSetActiveFolder={page.setActiveFolderId}
              onToggleFolderExpanded={page.toggleFolderExpanded}
              onRenameFolder={page.openRenameFolder}
              onDeleteFolder={page.setDeleteFolderTarget}
            />
          )}

          {showEditor && (
            <main className="flex min-w-0 flex-1 flex-col">
              {page.selectedNote ? (
                <NoteEditorPane
                  key={page.selectedNote._id}
                  note={page.selectedNote}
                  isSaving={page.isSaving}
                  showBack={isMobile}
                  onBack={page.clearSelection}
                  onTitleChange={(title) => page.autoSave({ title })}
                  onMarkdownChange={(markdown) => page.autoSave({ markdown })}
                />
              ) : (
                <div className="hidden flex-1 items-center justify-center md:flex">
                  <p className="text-sm text-muted-foreground">
                    Select or create a note
                  </p>
                </div>
              )}
            </main>
          )}
        </div>

        <RenameFolderDialog
          open={Boolean(page.renameFolderTarget)}
          name={page.renameFolderName}
          isSubmitting={page.isSubmitting}
          onOpenChange={(open) => {
            if (!open) page.setRenameFolderTarget(null);
          }}
          onNameChange={page.setRenameFolderName}
          onSubmit={() => void page.submitRenameFolder()}
        />

        <ConfirmDialog
          open={Boolean(page.deleteFolderTarget)}
          onOpenChange={(open) => {
            if (!open) page.setDeleteFolderTarget(null);
          }}
          title="Delete folder?"
          description="Empty folders only. Move or delete notes inside first."
          confirmLabel="Delete"
          confirmVariant="destructive"
          loading={page.isSubmitting}
          onConfirm={() => page.confirmDeleteFolder()}
        />

        <ConfirmDialog
          open={Boolean(page.deleteNoteTarget)}
          onOpenChange={(open) => {
            if (!open) page.setDeleteNoteTarget(null);
          }}
          title="Delete note?"
          description="This cannot be undone."
          confirmLabel="Delete"
          confirmVariant="destructive"
          loading={page.isSubmitting}
          onConfirm={() => page.confirmDeleteNote()}
        />
      </div>
    </TooltipProvider>
  );
}
