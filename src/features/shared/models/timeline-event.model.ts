import mongoose from "mongoose";

const { Schema } = mongoose;

export interface TimelineEventDocument extends mongoose.Document {
  title: string;
  start: Date;
  days: number;
  color: string;
  type: "sprint" | "marathon";
  createdAt: Date;
}

const TimelineEventSchema = new Schema<TimelineEventDocument>(
  {
    title: { type: String, required: true },
    start: { type: Date, required: true },
    days: { type: Number, required: true, min: 1 },
    color: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["sprint", "marathon"],
      default: "sprint",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.TimelineEvent) {
  mongoose.deleteModel("TimelineEvent");
}

export const TimelineEventModel = mongoose.model<TimelineEventDocument>(
  "TimelineEvent",
  TimelineEventSchema,
);
