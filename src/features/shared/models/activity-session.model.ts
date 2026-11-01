import mongoose from "mongoose";
import {
  ACTIVITY_STATES,
  type StoredActivityState,
} from "@/features/activity/lib/activity-states";

const { Schema } = mongoose;

const storedStates = ACTIVITY_STATES.filter((state) => state !== "free");

export interface ActivitySessionDocument extends mongoose.Document {
  startedAt: Date;
  endedAt: Date | null;
  state: StoredActivityState;
  open: boolean;
}

const ActivitySessionSchema = new Schema<ActivitySessionDocument>(
  {
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    state: {
      type: String,
      required: true,
      enum: storedStates,
    },
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
