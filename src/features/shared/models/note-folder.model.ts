import mongoose from "mongoose";
import type { NoteFolder } from "../../notes/types";

const { Schema } = mongoose;

export interface NoteFolderMongooseDocument
  extends Omit<NoteFolder, "_id" | "userId" | "parentId">,
    mongoose.Document {
  userId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
}

const NoteFolderSchema = new Schema<NoteFolderMongooseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, default: null, index: true },
    name: { type: String, required: true, default: "Folder" },
  },
  { timestamps: true },
);

NoteFolderSchema.index({ userId: 1, parentId: 1 });

if (mongoose.models.NoteFolder) {
  mongoose.deleteModel("NoteFolder");
}

export const NoteFolderModel = mongoose.model<NoteFolderMongooseDocument>(
  "NoteFolder",
  NoteFolderSchema,
);
