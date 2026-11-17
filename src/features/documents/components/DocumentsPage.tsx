"use client";

import type { JSONContent } from "@tiptap/react";
import { useDocuments } from "../hooks/use-documents";
import { DocumentSidebar } from "./DocumentSidebar";
import { DocumentEditorHeader } from "./DocumentEditorHeader";
import { DocumentEditor } from "./DocumentEditor";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentType } from "../types";

export function DocumentsPage() {
  const {
    filteredDocuments,
    selectedDocument,
    selectedDocumentId,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    createDocument,
    selectDocument,
    deleteDocument,
    autoSave,
  } = useDocuments();

  const handleTitleChange = (title: string) => {
    autoSave({ title });
  };

  const handleTypeChange = (type: DocumentType) => {
    autoSave({ type });
  };

  const handleDateChange = (date: Date | undefined) => {
    autoSave({ date: date ?? null });
  };

  const handleContentChange = (content: JSONContent) => {
    autoSave({ content });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 text-white">
      <DocumentSidebar
        documents={filteredDocuments}
        selectedDocumentId={selectedDocumentId ?? null}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={selectDocument}
        onCreate={createDocument}
        onDelete={deleteDocument}
        isLoading={isLoading}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {selectedDocument ? (
          <>
            <DocumentEditorHeader
              title={selectedDocument.title}
              type={selectedDocument.type}
              date={
                selectedDocument.date
                  ? new Date(selectedDocument.date)
                  : undefined
              }
              isSaving={isSaving}
              onTitleChange={handleTitleChange}
              onTypeChange={handleTypeChange}
              onDateChange={handleDateChange}
            />
            <DocumentEditor
              key={selectedDocument._id}
              documentId={selectedDocument._id}
              content={
                selectedDocument.content &&
                typeof selectedDocument.content === "object" &&
                Object.keys(selectedDocument.content).length > 0
                  ? (selectedDocument.content as JSONContent)
                  : { type: "doc", content: [] }
              }
              onChange={handleContentChange}
            />
          </>
        ) : isLoading ? (
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <EmptyDocumentState onCreate={createDocument} />
        )}
      </main>
    </div>
  );
}
