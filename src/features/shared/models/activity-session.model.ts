import mongoose from "mongoose";

const { Schema } = mongoose;

export interface ActivitySessionDocument extends mongoose.Document {
  startedAt: Date;
  endedAt: Date | null;
  lastNudgedAt: Date | null;
  open: boolean;
}

const ActivitySessionSchema = new Schema<ActivitySessionDocument>(
  {
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    lastNudgedAt: { type: Date, default: null },
    // True only while the session is open. Exists so the partial index can
    // reject a second open session. Reads still use endedAt.
    open: { type: Boolean, default: false },
  },
  { timestamps: false },
);

ActivitySessionSchema.index(
  { open: 1 },
  {
    unique: true,
    partialFilterExpression: { open: true },
  },
);

if (mongoose.models.ActivitySession) {
  mongoose.deleteModel("ActivitySession");
}

export const ActivitySessionModel = mongoose.model<ActivitySessionDocument>(
  "ActivitySession",
  ActivitySessionSchema,
);
