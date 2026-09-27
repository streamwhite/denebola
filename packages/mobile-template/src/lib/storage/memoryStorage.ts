import type { Storage } from "./types";

export function createMemoryStorage(): Storage {
  const values = new Map<string, unknown>();
  return {
    async get<T>(key: string) { return (values.get(key) as T | undefined) ?? null; },
    async set<T>(key: string, value: T) { values.set(key, value); },
    async remove(key: string) { values.delete(key); },
    async clear() { values.clear(); },
  };
}
