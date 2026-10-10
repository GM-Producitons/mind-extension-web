import mongoose from "mongoose";

const { Schema } = mongoose;

export interface BucketItemDocument extends mongoose.Document {
  label: string;
  createdAt: Date;
}

const BucketItemSchema = new Schema<BucketItemDocument>(
  {
    label: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.BucketItem) {
  mongoose.deleteModel("BucketItem");
}

export const BucketItemModel = mongoose.model<BucketItemDocument>(
  "BucketItem",
  BucketItemSchema,
);
