export type PaginationState = { page: number; pageSize: number };
export type PaginationMeta = { pageCount: number; canPrev: boolean; canNext: boolean };

export function computePagination(total: number, { page, pageSize }: PaginationState): PaginationMeta {
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return { pageCount, canPrev: page > 1, canNext: page < pageCount };
}

export function paginate<T>(items: readonly T[], { page, pageSize }: PaginationState): T[] {
  const start = Math.max(0, (page - 1) * pageSize);
  return items.slice(start, start + pageSize);
}

export function clampPage(page: number, meta: PaginationMeta): number {
  return Math.min(Math.max(1, page), meta.pageCount);
}
