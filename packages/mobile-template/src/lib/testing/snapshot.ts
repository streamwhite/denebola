export const DEFAULT_VOLATILE_KEYS = ["id", "createdAt", "updatedAt", "timestamp", "requestId"] as const;
export const SNAPSHOT_PLACEHOLDER = "[snapshot]";

// Replaces volatile fields with a stable placeholder so snapshots don't churn between runs.
export function stableSnapshot(value: unknown, volatileKeys: readonly string[] = DEFAULT_VOLATILE_KEYS): unknown {
  if (Array.isArray(value)) return value.map((item) => stableSnapshot(item, volatileKeys));
  if (!value || typeof value !== "object") return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = volatileKeys.includes(key) ? SNAPSHOT_PLACEHOLDER : stableSnapshot(item, volatileKeys);
  }
  return result;
}
