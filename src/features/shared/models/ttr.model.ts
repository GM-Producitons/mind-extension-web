import mongoose from "mongoose";

const { Schema } = mongoose;

export interface TtrDocument extends mongoose.Document {
  title: string;
  date: Date;
  tags: string[];
  createdAt: Date;
}

const TtrSchema = new Schema<TtrDocument>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.Ttr) {
  mongoose.deleteModel("Ttr");
}

export const TtrModel = mongoose.model<TtrDocument>("Ttr", TtrSchema);
