import mongoose from "mongoose";

const PaceGroupSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    unit: { type: String, required: true },
    order: { type: Number, required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.PaceGroup) {
  mongoose.deleteModel("PaceGroup");
}

export const PaceGroupModel = mongoose.model("PaceGroup", PaceGroupSchema);
