import mongoose from "mongoose";

const { Schema } = mongoose;

const MomentSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export interface PersonDocument extends mongoose.Document {
  name: string;
  gender: "male" | "female";
  birthday: Date | null;
  likes: string[];
  hates: string[];
  moments: { text: string; createdAt: Date }[];
  linkedIds: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PersonSchema = new Schema<PersonDocument>(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    birthday: { type: Date, default: null },
    likes: { type: [String], default: [] },
    hates: { type: [String], default: [] },
    moments: { type: [MomentSchema], default: [] },
    linkedIds: [{ type: Schema.Types.ObjectId, ref: "Person" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.Person) {
  mongoose.deleteModel("Person");
}

export const PersonModel = mongoose.model<PersonDocument>("Person", PersonSchema);
