import mongoose from "mongoose";
const { Schema } = mongoose;

export interface Mission {
  _id: mongoose.Types.ObjectId;
  title: string;
  priority: number;
  deadline: Date;
  tasks: mongoose.Types.ObjectId[];
}

const MissionSchema = new Schema({
  title: { type: String, required: true },
  priority: { type: Number, required: true },
  deadline: { type: Date, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

export const Mission =
  mongoose.models.Mission || mongoose.model("Mission", MissionSchema);
