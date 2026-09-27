import type { QueryClient } from "@tanstack/react-query";
import type { Storage } from "../storage/types";

export type PersistedQueryCache = { buster: string; timestamp: number; clientState: unknown };

export const QUERY_CACHE_KEY = "app.queryCache";
export const QUERY_CACHE_BUSTER = "1";

export function createQueryPersister(storage: Storage, key = QUERY_CACHE_KEY) {
  return {
    async persist(client: QueryClient): Promise<void> {
      const clientState = client.getQueryCache().getAll().map((query) => ({
        queryKey: query.queryKey,
        queryHash: query.queryHash,
        state: { data: query.state.data, dataUpdatedAt: query.state.dataUpdatedAt },
      }));
      const payload: PersistedQueryCache = { buster: QUERY_CACHE_BUSTER, timestamp: Date.now(), clientState };
      await storage.set(key, payload);
    },
    async restore(client: QueryClient): Promise<number> {
      const payload = await storage.get<PersistedQueryCache>(key);
      if (!payload || payload.buster !== QUERY_CACHE_BUSTER) return 0;
      const entries = Array.isArray(payload.clientState) ? payload.clientState : [];
      for (const entry of entries as { queryKey: unknown[]; state: { data: unknown; dataUpdatedAt: number } }[]) {
        client.setQueryData(entry.queryKey, entry.state.data, { updatedAt: entry.state.dataUpdatedAt });
      }
      return entries.length;
    },
    async clear(): Promise<void> {
      await storage.remove(key);
    },
  };
}

export type QueryPersister = ReturnType<typeof createQueryPersister>;
