import { PaceError } from "../pace-error";
import { isPaceIcon } from "./icons";
import { isIsoDate } from "./pace-math";
import type {
  BarInput,
  BarPatch,
  EntryInput,
  ExpectedRule,
  GroupInput,
  GroupPatch,
  PaceKind,
  PacePeriod,
  PaceSource,
} from "../types";

export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return base || "pace";
}

export function parseGroupInput(body: unknown): GroupInput {
  const record = objectBody(body);
  const input: GroupInput = {
    name: parseName(record.name),
    icon: parseIcon(record.icon),
    unit: parseUnit(record.unit),
  };
  if (record.order !== undefined) input.order = parseOrder(record.order);
  return input;
}

export function parseGroupPatch(body: unknown): GroupPatch {
  const record = objectBody(body);
  const patch: GroupPatch = {};
  if (record.name !== undefined) patch.name = parseName(record.name);
  if (record.icon !== undefined) patch.icon = parseIcon(record.icon);
  if (record.unit !== undefined) patch.unit = parseUnit(record.unit);
  if (record.order !== undefined) patch.order = parseOrder(record.order);
  if (record.archived !== undefined) patch.archived = parseArchived(record.archived);
  if (Object.keys(patch).length === 0) throw new PaceError("No changes", 400);
  return patch;
}

export function parseBarInput(body: unknown): BarInput {
  const record = objectBody(body);
  const input: BarInput = {
    name: parseName(record.name),
    icon: parseIcon(record.icon),
    unit: parseUnit(record.unit),
    startDate: parseDate(record.startDate, "Start date"),
    expectedRule: parseRule(record.expectedRule),
  };
  if (record.groupId !== undefined) input.groupId = parseGroupRef(record.groupId);
  if (record.noteChips !== undefined) input.noteChips = parseChips(record.noteChips);
  if (record.order !== undefined) input.order = parseOrder(record.order);
  return input;
}

export function parseBarPatch(body: unknown): BarPatch {
  const record = objectBody(body);
  const patch: BarPatch = {};
  if (record.name !== undefined) patch.name = parseName(record.name);
  if (record.icon !== undefined) patch.icon = parseIcon(record.icon);
  if (record.unit !== undefined) patch.unit = parseUnit(record.unit);
  if (record.groupId !== undefined) patch.groupId = parseGroupRef(record.groupId);
  if (record.startDate !== undefined) patch.startDate = parseDate(record.startDate, "Start date");
  if (record.expectedRule !== undefined) patch.expectedRule = parseRule(record.expectedRule);
  if (record.noteChips !== undefined) patch.noteChips = parseChips(record.noteChips);
  if (record.order !== undefined) patch.order = parseOrder(record.order);
  if (record.archived !== undefined) patch.archived = parseArchived(record.archived);
  if (Object.keys(patch).length === 0) throw new PaceError("No changes", 400);
  return patch;
}

export function parseEntryInput(body: unknown): EntryInput {
  const record = objectBody(body);
  const input: EntryInput = {
    kind: parseKind(record.kind),
    amount: parseAmount(record.amount),
    note: parseNote(record.note),
    source: parseSource(record.source),
  };
  if (record.date !== undefined && record.date !== null && record.date !== "") {
    input.date = parseDate(record.date, "Date");
  }
  const key = parseIdempotencyKey(record.idempotencyKey);
  if (key) input.idempotencyKey = key;
  return input;
}

export function parseUiEntry(body: unknown): Pick<EntryInput, "kind" | "amount" | "note"> {
  const record = objectBody(body);
  return {
    kind: parseKind(record.kind),
    amount: parseAmount(record.amount),
    note: parseNote(record.note),
  };
}

export function parseHistoryQuery(raw: {
  from?: string | null;
  to?: string | null;
  limit?: string | null;
}): { from?: string; to?: string; limit: number } {
  const query: { from?: string; to?: string; limit: number } = { limit: 50 };
  if (raw.from) query.from = parseDate(raw.from, "From");
  if (raw.to) query.to = parseDate(raw.to, "To");
  if (query.from && query.to && query.from > query.to) {
    throw new PaceError("from is after to", 400);
  }
  if (raw.limit != null && raw.limit !== "") {
    const limit = Number(raw.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new PaceError("Limit must be an integer from 1 to 100", 400);
    }
    query.limit = limit;
  }
  return query;
}

function objectBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new PaceError("Body must be an object", 400);
  }
  return body as Record<string, unknown>;
}

function parseName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PaceError("Name is required", 400);
  }
  const name = value.trim();
  if (name.length > 80) throw new PaceError("Name is too long", 400);
  return name;
}

function parseIcon(value: unknown): string {
  if (typeof value !== "string" || !isPaceIcon(value)) {
    throw new PaceError("Icon is not allowed", 400);
  }
  return value;
}

function parseUnit(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PaceError("Unit is required", 400);
  }
  const unit = value.trim();
  if (unit.length > 16) throw new PaceError("Unit is too long", 400);
  return unit;
}

function parseOrder(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10000) {
    throw new PaceError("Order must be an integer from 0 to 10000", 400);
  }
  return value;
}

function parseArchived(value: unknown): boolean {
  if (typeof value !== "boolean") throw new PaceError("Archived must be true or false", 400);
  return value;
}

function parseDate(value: unknown, label: string): string {
  if (typeof value !== "string" || !isIsoDate(value)) {
    throw new PaceError(`${label} must be YYYY-MM-DD`, 400);
  }
  return value;
}

function parseGroupRef(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PaceError("Group is invalid", 400);
  }
  return value.trim();
}

function parseChips(value: unknown): string[] {
  if (!Array.isArray(value)) throw new PaceError("Note chips must be a list", 400);
  if (value.length > 8) throw new PaceError("Too many note chips", 400);
  const chips: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new PaceError("Note chip is empty", 400);
    }
    const chip = item.trim();
    if (chip.length > 40) throw new PaceError("Note chip is too long", 400);
    if (!chips.includes(chip)) chips.push(chip);
  }
  return chips;
}

export function parseRule(value: unknown): ExpectedRule {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PaceError("Expected rule is required", 400);
  }
  const rule = value as Record<string, unknown>;
  if (rule.type !== "schedule" && rule.type !== "events" && rule.type !== "both") {
    throw new PaceError("Expected rule type must be schedule, events, or both", 400);
  }
  if (rule.type === "events") {
    if (rule.amount != null || rule.period != null) {
      throw new PaceError("Events rules do not take amount or period", 400);
    }
    return { type: "events" };
  }
  if (
    typeof rule.amount !== "number" ||
    !Number.isInteger(rule.amount) ||
    rule.amount < 1 ||
    rule.amount > 99
  ) {
    throw new PaceError("Schedule amount must be an integer from 1 to 99", 400);
  }
  if (rule.period !== "day" && rule.period !== "week" && rule.period !== "month") {
    throw new PaceError("Schedule period must be day, week, or month", 400);
  }
  const period: PacePeriod = rule.period;
  return { type: rule.type, amount: rule.amount, period };
}

function parseKind(value: unknown): PaceKind {
  if (value !== "done" && value !== "expected") {
    throw new PaceError("Kind must be done or expected", 400);
  }
  return value;
}

function parseAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 99) {
    throw new PaceError("Amount must be an integer from 1 to 99", 400);
  }
  return value;
}

function parseNote(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PaceError("Note is required", 400);
  }
  const note = value.trim();
  if (note.length > 200) throw new PaceError("Note is too long", 400);
  return note;
}

function parseSource(value: unknown): PaceSource {
  if (value !== "grok" && value !== "ui") {
    throw new PaceError("Source must be grok or ui", 400);
  }
  return value;
}

function parseIdempotencyKey(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string" || !/^[A-Za-z0-9._:-]{1,80}$/.test(value)) {
    throw new PaceError("Idempotency key must be 1-80 letters, numbers, or . _ : -", 400);
  }
  return value;
}
