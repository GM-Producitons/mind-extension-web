"use server";

import {
  addPersonEntryService,
  createPersonService,
  getPersonService,
  listPeopleService,
  setPersonLinksService,
} from "../services/people.service";
import type { Gender, PersonEntryKind } from "../types";

export async function listPeopleAction() {
  try {
    return await listPeopleService();
  } catch (error) {
    console.error("listPeopleAction", error);
    return { success: false as const, error: "Could not load people" };
  }
}

export async function getPersonAction(id: string) {
  try {
    return await getPersonService(id);
  } catch (error) {
    console.error("getPersonAction", error);
    return { success: false as const, error: "Could not load person" };
  }
}

export async function createPersonAction(input: {
  name: string;
  gender: Gender;
  birthday: string | null;
}) {
  try {
    return await createPersonService(input);
  } catch (error) {
    console.error("createPersonAction", error);
    return { success: false as const, error: "Could not add person" };
  }
}

export async function addPersonEntryAction(
  id: string,
  kind: PersonEntryKind,
  text: string,
) {
  try {
    return await addPersonEntryService(id, kind, text);
  } catch (error) {
    console.error("addPersonEntryAction", error);
    return { success: false as const, error: "Could not save" };
  }
}

export async function setPersonLinksAction(id: string, linkedIds: string[]) {
  try {
    return await setPersonLinksService(id, linkedIds);
  } catch (error) {
    console.error("setPersonLinksAction", error);
    return { success: false as const, error: "Could not update links" };
  }
}
