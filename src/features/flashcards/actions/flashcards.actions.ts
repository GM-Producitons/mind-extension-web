"use server";

import {
  createClusterService,
  createFlashcardService,
  deleteClusterService,
  getClustersService,
  getPracticeDeckService,
  gradeFlashcardService,
  renameClusterService,
} from "../services/flashcards.service";
import type { ActionResult, CreateFlashcardInput, Grade } from "../types";

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

export async function getClustersAction() {
  return run(getClustersService, "Could not load clusters");
}

export async function createClusterAction(name: string) {
  return run(() => createClusterService(name), "Could not create cluster");
}

export async function renameClusterAction(id: string, name: string) {
  return run(() => renameClusterService(id, name), "Could not rename cluster");
}

export async function deleteClusterAction(id: string) {
  return run(() => deleteClusterService(id), "Could not delete cluster");
}

export async function createFlashcardAction(input: CreateFlashcardInput) {
  return run(() => createFlashcardService(input), "Could not add card");
}

export async function getPracticeDeckAction(clusterId?: string) {
  return run(
    () => getPracticeDeckService(clusterId),
    "Could not load cards",
  );
}

export async function gradeFlashcardAction(id: string, result: Grade) {
  return run(() => gradeFlashcardService(id, result), "Could not save grade");
}
