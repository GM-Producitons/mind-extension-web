import mongoose from "mongoose";

const { Schema } = mongoose;

export interface TodoDocument extends mongoose.Document {
  title: string;
  date: Date;
  fromTime: string;
  utcFromTime: string;
  untilTime: string;
  completed: boolean;
  /** Present when the todo belongs to a schedule mission */
  missionId?: string;
  createdAt: Date;
}

const TodoSchema = new Schema<TodoDocument>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    fromTime: { type: String, required: true, default: "09:00" },
    utcFromTime: { type: String, required: true, default: "09:00" },
    untilTime: { type: String, required: true, default: "10:00" },
    completed: { type: Boolean, required: true, default: false },
    missionId: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.Todo) {
  mongoose.deleteModel("Todo");
}

export const TodoModel = mongoose.model<TodoDocument>("Todo", TodoSchema);
