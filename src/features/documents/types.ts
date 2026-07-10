import type { JSONContent } from "@tiptap/react";

export type DocumentType =
  | "experience"
  | "trip"
  | "reflection"
  | "note"
  | "log";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  experience: "Experience",
  trip: "Trip",
  reflection: "Reflection",
  note: "Note",
  log: "Log",
};

export interface Document {
  _id: string;
  title: string;
  content: JSONContent;
  type: DocumentType;
  /** Optional. When set, the document can be shown on the timeline at this date. */
  date?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  title: string;
  content?: JSONContent;
  type: DocumentType;
  date?: Date;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: JSONContent;
  type?: DocumentType;
  date?: Date | null;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
