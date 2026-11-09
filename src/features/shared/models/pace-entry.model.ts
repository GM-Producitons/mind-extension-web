import mongoose from "mongoose";

const PaceEntrySchema = new mongoose.Schema(
  {
    barId: { type: mongoose.Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["done", "expected"], required: true },
    amount: { type: Number, required: true },
    note: { type: String, required: true },
    source: { type: String, enum: ["grok", "ui"], required: true },
    date: { type: String, required: true },
    idempotencyKey: { type: String },
    voidedAt: { type: Date, default: null },
    voidedBy: { type: String, enum: ["ui", "grok"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PaceEntrySchema.index({ barId: 1, createdAt: -1 });
PaceEntrySchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

if (mongoose.models.PaceEntry) {
  mongoose.deleteModel("PaceEntry");
}

export const PaceEntryModel = mongoose.model("PaceEntry", PaceEntrySchema);
