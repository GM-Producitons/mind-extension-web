import {
  addPersonEntry,
  createPerson,
  getPerson,
  listPeople,
  setPersonLinks,
} from "../lib/people.repository";
import type { Gender, PersonEntryKind, PersonGraph } from "../types";

function graphFrom(people: Awaited<ReturnType<typeof listPeople>>): PersonGraph {
  const seen = new Set<string>();
  const links: PersonGraph["links"] = [];
  for (const person of people) {
    for (const other of person.linkedIds) {
      const key = [person._id, other].sort().join(":");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: person._id, target: other });
    }
  }
  return {
    nodes: people.map((person) => ({ id: person._id, name: person.name })),
    links,
  };
}

export async function listPeopleService() {
  const people = await listPeople();
  return { success: true as const, data: { people, graph: graphFrom(people) } };
}

export async function getPersonService(id: string) {
  const person = await getPerson(id);
  if (!person) return { success: false as const, error: "Person not found" };
  const people = await listPeople();
  return { success: true as const, data: { person, people } };
}

export async function createPersonService(input: {
  name: string;
  gender: Gender;
  birthday: string | null;
}) {
  const name = input.name.trim();
  if (!name) return { success: false as const, error: "Name is required" };
  if (input.gender !== "male" && input.gender !== "female") {
    return { success: false as const, error: "Gender is required" };
  }
  const birthday = input.birthday ? new Date(input.birthday) : null;
  if (birthday && Number.isNaN(birthday.getTime())) {
    return { success: false as const, error: "Birthday is invalid" };
  }
  const person = await createPerson({
    name,
    gender: input.gender,
    birthday,
  });
  return { success: true as const, data: person };
}

export async function addPersonEntryService(
  id: string,
  kind: PersonEntryKind,
  text: string,
) {
  const value = text.trim();
  if (!value) return { success: false as const, error: "Write something first" };
  if (kind !== "like" && kind !== "hate" && kind !== "moment") {
    return { success: false as const, error: "Pick a type" };
  }
  const person = await addPersonEntry(id, kind, value);
  if (!person) return { success: false as const, error: "Person not found" };
  return { success: true as const, data: person };
}

export async function setPersonLinksService(id: string, linkedIds: string[]) {
  const person = await setPersonLinks(id, linkedIds);
  if (!person) return { success: false as const, error: "Person not found" };
  return { success: true as const, data: person };
}
