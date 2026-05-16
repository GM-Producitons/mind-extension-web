/* ─────────────────────────────────────────────── */
/*  Nested Path Utilities                          */
/* ─────────────────────────────────────────────── */

/**
 * Get a value from a nested object using a dot-separated path.
 *
 * @example
 * getNestedValue({ profile: { name: "John" } }, "profile.name") // "John"
 */
export function getNestedValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
): T | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current as T | undefined;
}

/**
 * Set a value on a nested object using a dot-separated path.
 * Returns a new object (immutable).
 *
 * @example
 * setNestedValue({ profile: { name: "John" } }, "profile.name", "Jane")
 * // { profile: { name: "Jane" } }
 */
export function setNestedValue<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split(".");
  if (keys.length === 0) return obj;

  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value };
  }

  const [head, ...rest] = keys;
  const child =
    obj[head] != null && typeof obj[head] === "object"
      ? (obj[head] as Record<string, unknown>)
      : {};

  return {
    ...obj,
    [head]: setNestedValue(child, rest.join("."), value),
  };
}
