import { isSensitiveKey, REDACTED, SENSITIVE_MARKERS } from "../logging/redact";

export const SENSITIVE_KEY_MARKERS: readonly string[] = SENSITIVE_MARKERS;

export function createSensitiveKeyMatcher(extraKeys: readonly string[] = []): (key: string) => boolean {
  const markers = [...SENSITIVE_MARKERS, ...extraKeys.map((key) => key.toLowerCase())];
  return (key: string) => isSensitiveKey(key, markers);
}

// Drops sensitive keys entirely from an object before it is logged or sent to a vendor.
export function filterSensitive(value: Record<string, unknown>, extraKeys: readonly string[] = []): Record<string, unknown> {
  const isSensitive = createSensitiveKeyMatcher(extraKeys);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !isSensitive(key)));
}

export function redactSensitive(value: Record<string, unknown>, extraKeys: readonly string[] = []): Record<string, unknown> {
  const isSensitive = createSensitiveKeyMatcher(extraKeys);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, isSensitive(key) ? REDACTED : item]));
}
