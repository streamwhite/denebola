export type QueryValue = string | number | boolean | null | undefined;

export function toQueryString(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    search.append(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}
