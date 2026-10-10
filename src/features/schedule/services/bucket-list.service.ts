import {
  createBucketItem,
  listBucketItems,
} from "../lib/bucket-list.repository";

export async function listBucketItemsService() {
  const items = await listBucketItems();
  return { success: true as const, data: items };
}

export async function addBucketItemService(label: string) {
  const trimmed = label.trim();
  if (!trimmed) {
    return { success: false as const, error: "Label is required" };
  }
  const item = await createBucketItem(trimmed);
  return { success: true as const, data: item };
}
