import { connectMongoose } from "@/lib/db";
import { DocumentModel } from "../../shared/models/document.model";
import type { CreateDocumentInput, UpdateDocumentInput } from "../types";

export async function createDocumentRecord(data: CreateDocumentInput) {
  await connectMongoose();
  const doc = await DocumentModel.create(data);
  return JSON.parse(JSON.stringify(doc));
}

export async function getDocumentRecords() {
  await connectMongoose();
  const docs = await DocumentModel.find().sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getDocumentRecordById(id: string) {
  await connectMongoose();
  const doc = await DocumentModel.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export async function updateDocumentRecord(
  id: string,
  patch: UpdateDocumentInput,
) {
  await connectMongoose();
  const doc = await DocumentModel.findByIdAndUpdate(id, patch, {
    new: true,
    includeResultMetadata: false,
  }).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export async function deleteDocumentRecord(id: string) {
  await connectMongoose();
  await DocumentModel.findByIdAndDelete(id);
}
