import { PaceError } from "../pace-error";
import {
  countBarsInGroup,
  findBar,
  findEntryById,
  findEntryByKey,
  findGroup,
  findGroupById,
  insertBar,
  insertEntry,
  insertGroup,
  isDuplicateKey,
  listBars,
  listBarsInGroup,
  listGroups,
  listHistory,
  listOpenEntries,
  nextOrder,
  slugTaken,
  updateBar,
  updateGroup,
  voidEntry,
} from "../lib/pace.repository";
import {
  cairoToday,
  foldEntries,
  paceStatus,
  scheduleExpected,
  type FoldResult,
} from "../lib/pace-math";
import { resolvePaceColor } from "../lib/colors";
import { slugify } from "../lib/validate";
import type {
  BarInput,
  BarPatch,
  EntryInput,
  ExpectedRule,
  GroupInput,
  GroupPatch,
  PaceBarRecord,
  PaceBarView,
  PaceBoard,
  PaceEntryRecord,
  PaceEntryView,
  PaceGroupRecord,
  PaceGroupView,
} from "../types";

const emptyFold = {
  done: 0,
  expectedEntries: 0,
  recentDone: 0,
  recentExpected: 0,
  undo: null,
};

export async function getBoard(): Promise<PaceBoard> {
  const today = cairoToday();
  const [groups, bars] = await Promise.all([listGroups(true), listBars(true)]);
  const folds = foldEntries(
    (await listOpenEntries(bars.map((bar) => bar.id))).map(toFoldSource),
    Date.now(),
  );
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const children = new Map<string, PaceBarView[]>();
  const solo: PaceBarView[] = [];

  for (const bar of bars) {
    const group = bar.groupId ? groupsById.get(bar.groupId) : undefined;
    if (bar.groupId && !group) continue;
    const view = toBarView(bar, folds.get(bar.id), group ?? null, today);
    if (group) {
      const list = children.get(group.id) ?? [];
      list.push(view);
      children.set(group.id, list);
    } else {
      solo.push(view);
    }
  }

  return {
    today,
    groups: groups.sort(byOrderName).map((group) => toGroupView(group, children.get(group.id) ?? [])),
    solo: solo.sort(byOrderName),
  };
}

export async function createGroup(input: GroupInput): Promise<{ group: PaceGroupView }> {
  const slug = await uniqueSlug(slugify(input.name));
  const order = input.order ?? (await nextOrder("group"));
  try {
    const group = await insertGroup({
      slug,
      name: input.name,
      icon: input.icon,
      unit: input.unit,
      color: input.color ?? null,
      order,
    });
    return { group: toGroupView(group, []) };
  } catch (error) {
    if (isDuplicateKey(error)) throw new PaceError("That name was just taken. Try again.", 409);
    throw error;
  }
}

export async function updateGroupByKey(
  key: string,
  patch: GroupPatch,
): Promise<{ group: PaceGroupView }> {
  const group = await findGroup(key);
  if (!group) throw new PaceError("Group not found", 404);
  if (patch.unit && patch.unit !== group.unit) {
    const count = await countBarsInGroup(group.id);
    if (count > 0) {
      throw new PaceError("Cannot change the unit while the group has bars", 400);
    }
  }
  await updateGroup(group.id, patch);
  return { group: await presentGroup(group.id) };
}

export async function createBar(input: BarInput): Promise<{ bar: PaceBarView }> {
  const group = await resolveGroupForBar(input.groupId, input.unit);
  const slug = await uniqueSlug(slugify(input.name));
  const order = input.order ?? (await nextOrder("bar"));
  try {
    const bar = await insertBar({
      slug,
      name: input.name,
      icon: input.icon,
      unit: input.unit,
      color: input.color ?? null,
      groupId: group?.id ?? null,
      startDate: input.startDate,
      expectedRule: cleanRule(input.expectedRule),
      noteChips: input.noteChips ?? [],
      order,
    });
    return { bar: await presentBar(bar.id) };
  } catch (error) {
    if (isDuplicateKey(error)) throw new PaceError("That name was just taken. Try again.", 409);
    throw error;
  }
}

export async function updateBarByKey(
  key: string,
  patch: BarPatch,
): Promise<{ bar: PaceBarView }> {
  const bar = await findBar(key);
  if (!bar) {
    if (await findGroup(key)) throw new PaceError("Entries go on a bar, not a group", 400);
    throw new PaceError("Bar not found", 404);
  }
  const nextUnit = patch.unit ?? bar.unit;
  let nextGroupId = bar.groupId;
  if (patch.groupId !== undefined) {
    const group = await resolveGroupForBar(patch.groupId, nextUnit);
    nextGroupId = group?.id ?? null;
  } else if (nextGroupId) {
    const group = await findGroupById(nextGroupId);
    if (group && nextUnit !== group.unit) {
      throw new PaceError("Unit must match the group", 400);
    }
  }
  const stored: BarPatch = { ...patch };
  if (patch.groupId !== undefined) stored.groupId = nextGroupId;
  if (patch.expectedRule) stored.expectedRule = cleanRule(patch.expectedRule);
  await updateBar(bar.id, stored);
  return { bar: await presentBar(bar.id) };
}

export async function getBar(key: string): Promise<{ today: string; bar: PaceBarView }> {
  const bar = await requireBar(key);
  return { today: cairoToday(), bar: await presentBar(bar.id) };
}

export async function addApiEntry(
  key: string,
  input: EntryInput,
): Promise<{ entry: PaceEntryView; bar: PaceBarView; replayed: boolean }> {
  return addEntry(key, input);
}

export async function addUiEntry(
  key: string,
  input: Pick<EntryInput, "kind" | "amount" | "note">,
): Promise<{ entry: PaceEntryView; bar: PaceBarView; replayed: boolean }> {
  return addEntry(key, { ...input, source: "ui", date: cairoToday() });
}

export async function getHistory(
  key: string,
  query: { from?: string; to?: string; limit: number },
): Promise<{ entries: PaceEntryView[]; total: number }> {
  const bar = await requireBar(key);
  const history = await listHistory(bar.id, query);
  return {
    entries: history.entries.map(toEntryView),
    total: history.total,
  };
}

export async function voidGrokEntry(
  entryId: string,
): Promise<{ entry: PaceEntryView; bar: PaceBarView }> {
  const entry = await findEntryById(entryId);
  if (!entry) throw new PaceError("Entry not found", 404);
  if (entry.source !== "grok") {
    throw new PaceError("The API key can void grok entries only", 400);
  }
  if (entry.voidedAt) throw new PaceError("Entry is already voided", 400);
  const voided = await voidEntry(entry.id, "grok");
  if (!voided) throw new PaceError("Entry is already voided", 400);
  const fresh = await findEntryById(entry.id);
  if (!fresh) throw new PaceError("Entry not found", 404);
  return { entry: toEntryView(fresh), bar: await presentBar(entry.barId) };
}

export async function voidLatestUiEntry(
  key: string,
): Promise<{ entry: PaceEntryView; bar: PaceBarView }> {
  const bar = await requireBar(key);
  const presented = await presentBar(bar.id);
  if (!presented.undo) throw new PaceError("No UI entry to undo", 400);
  const voided = await voidEntry(presented.undo.id, "ui");
  if (!voided) throw new PaceError("Entry is already voided", 400);
  const fresh = await findEntryById(presented.undo.id);
  if (!fresh) throw new PaceError("Entry not found", 404);
  return { entry: toEntryView(fresh), bar: await presentBar(bar.id) };
}

async function addEntry(
  key: string,
  input: EntryInput,
): Promise<{ entry: PaceEntryView; bar: PaceBarView; replayed: boolean }> {
  const bar = await requireBar(key);
  if (bar.archived) throw new PaceError("Bar is archived", 400);
  const today = cairoToday();
  const date = input.date ?? today;
  if (date > today) throw new PaceError("Date is after today", 400);
  if (date < bar.startDate) throw new PaceError("Date is before the bar start date", 400);

  if (input.idempotencyKey) {
    const existing = await findEntryByKey(input.idempotencyKey);
    if (existing) {
      assertSameEntry(existing, input, bar.id, date);
      return {
        entry: toEntryView(existing),
        bar: await presentBar(bar.id),
        replayed: true,
      };
    }
  }

  try {
    const created = await insertEntry({
      barId: bar.id,
      kind: input.kind,
      amount: input.amount,
      note: input.note,
      source: input.source,
      date,
      idempotencyKey: input.idempotencyKey,
    });
    return { entry: toEntryView(created), bar: await presentBar(bar.id), replayed: false };
  } catch (error) {
    if (!isDuplicateKey(error) || !input.idempotencyKey) throw error;
    const existing = await findEntryByKey(input.idempotencyKey);
    if (!existing) throw error;
    assertSameEntry(existing, input, bar.id, date);
    return {
      entry: toEntryView(existing),
      bar: await presentBar(bar.id),
      replayed: true,
    };
  }
}

function assertSameEntry(
  existing: PaceEntryRecord,
  input: EntryInput,
  barId: string,
  date: string,
) {
  const same =
    existing.barId === barId &&
    existing.kind === input.kind &&
    existing.amount === input.amount &&
    existing.note === input.note &&
    existing.source === input.source &&
    existing.date === date;
  if (!same) {
    throw new PaceError("Idempotency key was already used with a different entry", 409);
  }
}

async function requireBar(key: string): Promise<PaceBarRecord> {
  const bar = await findBar(key);
  if (bar) return bar;
  if (await findGroup(key)) throw new PaceError("Entries go on a bar, not a group", 400);
  throw new PaceError("Bar not found", 404);
}

async function resolveGroupForBar(
  groupId: string | null | undefined,
  unit: string,
): Promise<PaceGroupRecord | null> {
  if (!groupId) return null;
  const group = await findGroup(groupId);
  if (!group) throw new PaceError("Group not found", 404);
  if (group.archived) throw new PaceError("Group is archived", 400);
  if (group.unit !== unit) throw new PaceError("Unit must match the group", 400);
  return group;
}

async function presentBar(id: string): Promise<PaceBarView> {
  const bar = await findBar(id);
  if (!bar) throw new PaceError("Bar not found", 404);
  const today = cairoToday();
  const [entries, group] = await Promise.all([
    listOpenEntries([bar.id]),
    bar.groupId ? findGroupById(bar.groupId) : Promise.resolve(null),
  ]);
  const fold = foldEntries(entries.map(toFoldSource), Date.now()).get(bar.id);
  return toBarView(bar, fold, group, today);
}

async function presentGroup(id: string): Promise<PaceGroupView> {
  const group = await findGroupById(id);
  if (!group) throw new PaceError("Group not found", 404);
  const today = cairoToday();
  const bars = await listBarsInGroup(group.id, true);
  const folds = foldEntries(
    (await listOpenEntries(bars.map((bar) => bar.id))).map(toFoldSource),
    Date.now(),
  );
  const children = bars
    .map((bar) => toBarView(bar, folds.get(bar.id), group, today))
    .sort(byOrderName);
  return toGroupView(group, children);
}

async function uniqueSlug(base: string): Promise<string> {
  if (!(await slugTaken(base))) return base;
  for (let index = 2; index < 1000; index += 1) {
    const next = `${base}-${index}`;
    if (!(await slugTaken(next))) return next;
  }
  throw new PaceError("Could not make a slug", 400);
}

function cleanRule(rule: ExpectedRule): ExpectedRule {
  if (rule.type === "events") return { type: "events" };
  return { type: rule.type, amount: rule.amount, period: rule.period };
}

function toBarView(
  bar: PaceBarRecord,
  fold: FoldResult | undefined,
  group: PaceGroupRecord | null,
  today: string,
): PaceBarView {
  const bucket = fold ?? emptyFold;
  const schedule = scheduleExpected(bar.expectedRule, bar.startDate, today);
  const done = bucket.done;
  const expected = schedule + bucket.expectedEntries;
  return {
    id: bar.id,
    slug: bar.slug,
    name: bar.name,
    icon: bar.icon,
    unit: bar.unit,
    color: resolvePaceColor(bar.color, group?.color),
    ownColor: bar.color,
    groupId: bar.groupId,
    groupSlug: group?.slug ?? null,
    startDate: bar.startDate,
    expectedRule: cleanRule(bar.expectedRule),
    noteChips: bar.noteChips,
    order: bar.order,
    archived: bar.archived,
    createdAt: bar.createdAt.toISOString(),
    done,
    expected,
    owed: expected - done,
    status: paceStatus(done, expected),
    recentDone: bucket.recentDone,
    recentExpected: bucket.recentExpected,
    undo: bucket.undo,
  };
}

function toGroupView(group: PaceGroupRecord, children: PaceBarView[]): PaceGroupView {
  const sorted = children.slice().sort(byOrderName);
  const done = sorted.reduce((sum, child) => sum + child.done, 0);
  const expected = sorted.reduce((sum, child) => sum + child.expected, 0);
  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    icon: group.icon,
    unit: group.unit,
    color: resolvePaceColor(group.color),
    ownColor: group.color,
    order: group.order,
    archived: group.archived,
    createdAt: group.createdAt.toISOString(),
    done,
    expected,
    owed: expected - done,
    status: paceStatus(done, expected),
    recentDone: sorted.reduce((sum, child) => sum + child.recentDone, 0),
    recentExpected: sorted.reduce((sum, child) => sum + child.recentExpected, 0),
    childCount: sorted.length,
    children: sorted,
  };
}

function toEntryView(entry: PaceEntryRecord): PaceEntryView {
  return {
    id: entry.id,
    barId: entry.barId,
    kind: entry.kind,
    amount: entry.amount,
    note: entry.note,
    source: entry.source,
    date: entry.date,
    idempotencyKey: entry.idempotencyKey,
    createdAt: entry.createdAt.toISOString(),
    voidedAt: entry.voidedAt ? entry.voidedAt.toISOString() : null,
    voidedBy: entry.voidedBy,
  };
}

function toFoldSource(entry: PaceEntryRecord) {
  return {
    id: entry.id,
    barId: entry.barId,
    kind: entry.kind,
    amount: entry.amount,
    note: entry.note,
    source: entry.source,
    createdAt: entry.createdAt.getTime(),
  };
}

function byOrderName<T extends { order: number; name: string }>(a: T, b: T) {
  return a.order - b.order || a.name.localeCompare(b.name);
}
