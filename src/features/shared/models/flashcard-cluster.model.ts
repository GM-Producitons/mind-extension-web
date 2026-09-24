import mongoose from "mongoose";

const { Schema } = mongoose;

export interface FlashcardClusterMongooseDocument extends mongoose.Document {
  name: string;
  lastTrainedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardClusterSchema = new Schema<FlashcardClusterMongooseDocument>(
  {
    name: { type: String, required: true, trim: true },
    lastTrainedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

FlashcardClusterSchema.index({ name: 1 });

if (mongoose.models.FlashcardCluster) {
  mongoose.deleteModel("FlashcardCluster");
}

export const FlashcardClusterModel =
  mongoose.model<FlashcardClusterMongooseDocument>(
    "FlashcardCluster",
    FlashcardClusterSchema,
  );
