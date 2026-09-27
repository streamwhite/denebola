export type SortDirection = "asc" | "desc";

export function sortByValue<T>(items: readonly T[], selector: (item: T) => string | number, direction: SortDirection = "asc"): T[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...items].sort((left, right) => {
    const a = selector(left);
    const b = selector(right);
    if (a < b) return -factor;
    if (a > b) return factor;
    return 0;
  });
}

export function filterItems<T>(items: readonly T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

export function searchItems<T>(items: readonly T[], query: string, selector: (item: T) => string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) => selector(item).toLowerCase().includes(needle));
}

export type Page<T> = { items: T[]; page: number; pageCount: number; hasMore: boolean };

export function pageOf<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / Math.max(1, pageSize)));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, pageCount, hasMore: current < pageCount };
}
