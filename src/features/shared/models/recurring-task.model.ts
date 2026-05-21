import mongoose from "mongoose";
import type { RecurringTask } from "../../recurring-tasks/types";

const { Schema } = mongoose;

export interface RecurringTaskDocument
  extends Omit<RecurringTask, "_id">, mongoose.Document {}

const RecurringTaskSchema = new Schema<RecurringTaskDocument>(
  {
    title: { type: String, required: true },
    fromTime: { type: String, required: true },
    untilTime: { type: String, required: true },
    days: [{ type: Number, min: 0, max: 6 }],
    category: {
      type: String,
      required: true,
      enum: ["study", "work", "gym", "personal", "meshwar", "event"],
      default: "personal",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.RecurringTask) {
  mongoose.deleteModel("RecurringTask");
}

export const RecurringTaskModel = mongoose.model<RecurringTaskDocument>(
  "RecurringTask",
  RecurringTaskSchema,
);
