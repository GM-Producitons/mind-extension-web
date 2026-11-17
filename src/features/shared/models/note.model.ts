import mongoose from "mongoose";
import type { Note } from "../../notes/types";

const { Schema } = mongoose;

export interface NoteMongooseDocument
  extends Omit<Note, "_id" | "userId" | "folderId">,
    mongoose.Document {
  userId: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId | null;
}

const NoteSchema = new Schema<NoteMongooseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    folderId: { type: Schema.Types.ObjectId, default: null, index: true },
    title: { type: String, default: "Untitled" },
    markdown: { type: String, default: "" },
  },
  { timestamps: true },
);

NoteSchema.index({ userId: 1, folderId: 1 });
NoteSchema.index({ userId: 1, updatedAt: -1 });

if (mongoose.models.Note) {
  mongoose.deleteModel("Note");
}

export const NoteModel = mongoose.model<NoteMongooseDocument>(
  "Note",
  NoteSchema,
);
