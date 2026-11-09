import mongoose from "mongoose";

const ExpectedRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["schedule", "events", "both"],
      required: true,
    },
    amount: { type: Number },
    period: { type: String, enum: ["day", "week", "month"] },
  },
  { _id: false },
);

const PaceBarSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    unit: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, default: null },
    startDate: { type: String, required: true },
    expectedRule: { type: ExpectedRuleSchema, required: true },
    noteChips: { type: [String], default: [] },
    order: { type: Number, required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

if (mongoose.models.PaceBar) {
  mongoose.deleteModel("PaceBar");
}

export const PaceBarModel = mongoose.model("PaceBar", PaceBarSchema);
