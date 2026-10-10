"use server";

import {
  addBucketItemService,
  listBucketItemsService,
} from "../services/bucket-list.service";

export async function listBucketItemsAction() {
  try {
    return await listBucketItemsService();
  } catch (error) {
    console.error("listBucketItemsAction", error);
    return { success: false as const, error: "Could not load bucket" };
  }
}

export async function addBucketItemAction(label: string) {
  try {
    return await addBucketItemService(label);
  } catch (error) {
    console.error("addBucketItemAction", error);
    return { success: false as const, error: "Could not add item" };
  }
}
