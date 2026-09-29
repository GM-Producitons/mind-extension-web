import { connectMongoose } from "@/lib/db";
import { MyInstaPostModel } from "@/features/shared/models/myinsta-post.model";
import type { CreatePostInput, MyInstaPost, PostImage } from "../types";

interface RawImage {
  url?: unknown;
  pathname?: unknown;
  width?: unknown;
  height?: unknown;
  order?: unknown;
}

interface RawPost {
  _id: unknown;
  userId: unknown;
  username: string;
  caption?: string;
  images?: RawImage[];
  liked?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asIso(value: Date | string | null | undefined) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value.toISOString();
}

function asImage(image: RawImage, index: number): PostImage | null {
  if (typeof image.url !== "string" || typeof image.pathname !== "string") {
    return null;
  }
  return {
    url: image.url,
    pathname: image.pathname,
    width: typeof image.width === "number" ? image.width : undefined,
    height: typeof image.height === "number" ? image.height : undefined,
    order: typeof image.order === "number" ? image.order : index,
  };
}

function asPost(doc: RawPost): MyInstaPost {
  const images = (doc.images ?? [])
    .map(asImage)
    .filter((image): image is PostImage => image != null)
    .sort((a, b) => a.order - b.order);

  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    username: doc.username,
    caption: doc.caption ?? "",
    images,
    liked: Boolean(doc.liked),
    createdAt: asIso(doc.createdAt),
    updatedAt: asIso(doc.updatedAt),
  };
}

export async function listPostRecords(userId: string) {
  await connectMongoose();
  const docs = await MyInstaPostModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlain(docs).map(asPost);
}

export async function createPostRecord(
  userId: string,
  username: string,
  input: CreatePostInput,
) {
  await connectMongoose();
  const doc = await MyInstaPostModel.create({
    userId,
    username,
    caption: input.caption,
    images: input.images,
    liked: false,
  });
  return asPost(toPlain(doc.toObject()));
}

export async function getPostRecord(id: string, userId: string) {
  await connectMongoose();
  const doc = await MyInstaPostModel.findOne({ _id: id, userId }).lean();
  if (!doc) return null;
  return asPost(toPlain(doc));
}

export async function toggleLikeRecord(id: string, userId: string) {
  await connectMongoose();
  const existing = await MyInstaPostModel.findOne({ _id: id, userId }).lean();
  if (!existing) return null;

  const doc = await MyInstaPostModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { liked: !existing.liked } },
    { returnDocument: "after" },
  ).lean();
  if (!doc) return null;
  return asPost(toPlain(doc));
}

export async function deletePostRecord(id: string, userId: string) {
  await connectMongoose();
  const doc = await MyInstaPostModel.findOneAndDelete({ _id: id, userId }).lean();
  if (!doc) return null;
  return asPost(toPlain(doc));
}
