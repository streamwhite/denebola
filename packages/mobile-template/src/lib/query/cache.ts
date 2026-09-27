import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type ListCache<T> = { items: T[]; total?: number; nextCursor?: string | null };
export type InfiniteCache<T> = { pages: T[]; pageParams: unknown[] };

export function invalidateScope(client: QueryClient, scope: string): Promise<void> {
  return client.invalidateQueries({ queryKey: [scope] });
}

export function invalidateKeys(client: QueryClient, keys: readonly QueryKey[]): Promise<void[]> {
  return Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
}

export function prefetchQuery<T>(client: QueryClient, queryKey: QueryKey, queryFn: () => Promise<T>, staleTime?: number): Promise<void> {
  return client.prefetchQuery({ queryKey, queryFn, ...(staleTime !== undefined ? { staleTime } : {}) });
}

export function snapshotQueries<T>(client: QueryClient, queryKey: QueryKey): [QueryKey, T | undefined][] {
  return client.getQueriesData<T>({ queryKey }).map(([key, data]) => [key, data] as [QueryKey, T | undefined]);
}

export function restoreQueries(client: QueryClient, snapshot: readonly [QueryKey, unknown][]): void {
  for (const [queryKey, data] of snapshot) client.setQueryData(queryKey, data);
}

// Optimistic list update: apply `update` to every cached list in scope, returning a snapshot
// to roll back on error.
export function optimisticListUpdate<T>(client: QueryClient, scope: string, update: (items: T[]) => T[]): [QueryKey, ListCache<T> | undefined][] {
  const snapshot = snapshotQueries<ListCache<T>>(client, [scope]);
  for (const [queryKey, data] of snapshot) {
    if (data && Array.isArray(data.items)) client.setQueryData(queryKey, { ...data, items: update(data.items) });
  }
  return snapshot;
}

// Optimistic detail update for a single item, returning a snapshot to roll back on error.
export function optimisticDetailUpdate<T>(client: QueryClient, queryKey: QueryKey, update: (current: T | undefined) => T | undefined): [QueryKey, T | undefined][] {
  const snapshot = client.getQueriesData<T>({ queryKey });
  for (const [key, data] of snapshot) client.setQueryData(key, update(data));
  return snapshot.map(([key, data]) => [key, data] as [QueryKey, T | undefined]);
}

export function rollbackQueries(client: QueryClient, snapshot: readonly [QueryKey, unknown][]): void {
  restoreQueries(client, snapshot);
}

export function appendInfinitePage<T>(cache: InfiniteCache<T> | undefined, page: T, pageParam: unknown): InfiniteCache<T> {
  if (!cache) return { pages: [page], pageParams: [pageParam] };
  return { pages: [...cache.pages, page], pageParams: [...cache.pageParams, pageParam] };
}
