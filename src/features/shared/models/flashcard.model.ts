import mongoose from "mongoose";

const { Schema } = mongoose;

export interface FlashcardMongooseDocument extends mongoose.Document {
  clue: string;
  hidden: string;
  clusterIds: mongoose.Types.ObjectId[];
  lastResult: "knew" | "missed" | null;
  lastTrainedAt: Date | null;
  knewCount: number;
  missedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<FlashcardMongooseDocument>(
  {
    clue: { type: String, required: true, trim: true },
    hidden: { type: String, required: true, trim: true },
    clusterIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "FlashcardCluster",
        required: true,
      },
    ],
    lastResult: {
      type: String,
      enum: ["knew", "missed", null],
      default: null,
    },
    lastTrainedAt: { type: Date, default: null },
    knewCount: { type: Number, default: 0 },
    missedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

FlashcardSchema.index({ clusterIds: 1 });

if (mongoose.models.Flashcard) {
  mongoose.deleteModel("Flashcard");
}

export const FlashcardModel = mongoose.model<FlashcardMongooseDocument>(
  "Flashcard",
  FlashcardSchema,
);
