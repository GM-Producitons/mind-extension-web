"use server";

import { z } from "zod";
import {
  createDocumentRecord,
  getDocumentRecords,
  updateDocumentRecord,
  deleteDocumentRecord,
} from "../lib/documents.repository";
import type { Document, ActionResult } from "../types";

const DocumentTypeSchema = z.enum([
  "experience",
  "trip",
  "reflection",
  "note",
  "log",
]);

const CreateDocumentSchema = z.object({
  title: z.string().default(""),
  content: z.record(z.string(), z.unknown()).optional(),
  type: DocumentTypeSchema,
  date: z.coerce.date().optional(),
});

const UpdateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  type: DocumentTypeSchema.optional(),
  date: z.coerce.date().nullable().optional(),
});

export async function createDocumentAction(
  raw: Record<string, unknown>,
): Promise<ActionResult<Document>> {
  const parsed = CreateDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  try {
    const doc = await createDocumentRecord(parsed.data);
    return { success: true, data: doc };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function getDocumentsAction(): Promise<ActionResult<Document[]>> {
  try {
    const docs = await getDocumentRecords();
    return { success: true, data: docs };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateDocumentAction(
  id: string,
  raw: Record<string, unknown>,
): Promise<ActionResult<Document>> {
  if (!id) return { success: false, error: "ID is required" };
  const parsed = UpdateDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  try {
    const doc = await updateDocumentRecord(id, parsed.data);
    if (!doc) return { success: false, error: "Document not found" };
    return { success: true, data: doc };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteDocumentAction(
  id: string,
): Promise<ActionResult<void>> {
  if (!id) return { success: false, error: "ID is required" };
  try {
    await deleteDocumentRecord(id);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
