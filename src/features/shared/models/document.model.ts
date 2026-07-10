import mongoose from "mongoose";
import type { Document as AppDocument } from "../../documents/types";

const { Schema } = mongoose;

export interface DocumentMongooseDocument
  extends Omit<AppDocument, "_id">, mongoose.Document {}

const DocumentSchema = new Schema<DocumentMongooseDocument>(
  {
    title: { type: String, required: false, default: "" },
    content: { type: Schema.Types.Mixed, default: {} },
    type: {
      type: String,
      required: true,
      enum: ["experience", "trip", "reflection", "note", "log"],
      default: "note",
    },
    date: { type: Date, default: null },
  },
  { timestamps: true },
);

if (mongoose.models.Document) {
  mongoose.deleteModel("Document");
}

export const DocumentModel = mongoose.model<DocumentMongooseDocument>(
  "Document",
  DocumentSchema,
);
