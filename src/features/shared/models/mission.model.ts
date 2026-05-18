import mongoose from "mongoose";

const { Schema } = mongoose;

export interface MissionDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  priority: number;
  deadline: Date;
  taskIds: string[];
  createdAt: Date;
}

const MissionSchema = new Schema<MissionDocument>(
  {
    name: { type: String, required: true },
    priority: { type: Number, required: true, min: 1, max: 5 },
    deadline: { type: Date, required: true },
    taskIds: [{ type: String, default: [] }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Delete any stale cached model (e.g. from old db/mission.ts with 'title' field)
// so the schema defined here always wins.
if (mongoose.models.Mission) {
  mongoose.deleteModel("Mission");
}

export const MissionModel = mongoose.model<MissionDocument>(
  "Mission",
  MissionSchema,
);
