"use server";

import {
  createPostService,
  deletePostService,
  discardUploadsService,
  listPostsService,
  toggleLikeService,
} from "../services/myinsta.service";
import type { ActionResult, CreatePostInput } from "../types";

async function run<T>(
  work: () => Promise<ActionResult<T>>,
  fallback: string,
): Promise<ActionResult<T>> {
  try {
    return await work();
  } catch (error) {
    console.error(fallback, error);
    return { success: false, error: fallback };
  }
}

export async function listPostsAction() {
  return run(listPostsService, "Could not load posts");
}

export async function createPostAction(input: CreatePostInput) {
  return run(() => createPostService(input), "Could not create post");
}

export async function toggleLikeAction(id: string) {
  return run(() => toggleLikeService(id), "Could not like post");
}

export async function deletePostAction(id: string) {
  return run(() => deletePostService(id), "Could not delete post");
}

export async function discardUploadsAction(pathnames: string[]) {
  return run(
    () => discardUploadsService(pathnames),
    "Could not discard uploads",
  );
}
