"use server";

import { getSessionUser } from "@/lib/session";
import { PaceError } from "../pace-error";
import {
  parseBarInput,
  parseBarPatch,
  parseGroupInput,
  parseGroupPatch,
  parseHistoryQuery,
  parseUiEntry,
} from "../lib/validate";
import {
  addUiEntry,
  createBar,
  createGroup,
  getBoard,
  getHistory,
  updateBarByKey,
  updateGroupByKey,
  voidLatestUiEntry,
} from "../services/pace.service";
import type { PaceActionResult } from "../types";

async function run<T>(work: () => Promise<T>): Promise<PaceActionResult<T>> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Unauthorized" };
  try {
    return { success: true, data: await work() };
  } catch (error) {
    if (error instanceof PaceError) return { success: false, error: error.message };
    console.error("pace action", error);
    return { success: false, error: "Pace request failed" };
  }
}

export async function getPaceBoardAction() {
  return run(() => getBoard());
}

export async function createPaceGroupAction(input: unknown) {
  return run(() => createGroup(parseGroupInput(input)));
}

export async function updatePaceGroupAction(slug: string, input: unknown) {
  return run(() => updateGroupByKey(slug, parseGroupPatch(input)));
}

export async function createPaceBarAction(input: unknown) {
  return run(() => createBar(parseBarInput(input)));
}

export async function updatePaceBarAction(slug: string, input: unknown) {
  return run(() => updateBarByKey(slug, parseBarPatch(input)));
}

export async function listPaceEntriesAction(slug: string) {
  return run(() => getHistory(slug, parseHistoryQuery({})));
}

export async function addPaceEntryAction(slug: string, input: unknown) {
  return run(() => addUiEntry(slug, parseUiEntry(input)));
}

export async function undoPaceEntryAction(slug: string) {
  return run(() => voidLatestUiEntry(slug));
}
