import { connectMongoose } from "@/lib/db";
import { BucketItemModel } from "@/features/shared/models/bucket-item.model";

export interface BucketItemRecord {
  _id: string;
  label: string;
  createdAt: string;
}

function toRecord(doc: {
  _id: unknown;
  label: string;
  createdAt: Date;
}): BucketItemRecord {
  return {
    _id: String(doc._id),
    label: doc.label,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function listBucketItems(): Promise<BucketItemRecord[]> {
  await connectMongoose();
  const docs = await BucketItemModel.find().sort({ createdAt: 1 }).lean();
  return docs.map((d) =>
    toRecord({
      _id: d._id,
      label: d.label,
      createdAt: d.createdAt,
    }),
  );
}

export async function createBucketItem(label: string): Promise<BucketItemRecord> {
  await connectMongoose();
  const doc = await BucketItemModel.create({ label });
  return toRecord({
    _id: doc._id,
    label: doc.label,
    createdAt: doc.createdAt,
  });
}
