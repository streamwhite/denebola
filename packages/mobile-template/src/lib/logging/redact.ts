export const SENSITIVE_MARKERS = ["password", "token", "secret", "authorization", "apikey", "credential"] as const;
export const REDACTED = "[redacted]";

export function isSensitiveKey(key: string, markers: readonly string[] = SENSITIVE_MARKERS): boolean {
  const normalized = key.toLowerCase();
  return markers.some((marker) => normalized.includes(marker));
}

export function redact(value: unknown, seen: WeakSet<object> = new WeakSet<object>()): unknown {
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) result[key] = isSensitiveKey(key) ? REDACTED : redact(item, seen);
  return result;
}
