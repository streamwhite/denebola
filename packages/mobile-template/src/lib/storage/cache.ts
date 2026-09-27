import { createMemoryStorage } from "./memoryStorage";
import type { Storage } from "./types";

export type CacheEntry<T> = { value: T; expiresAt: number | null };

export const CACHE_KEY = "app.cache";

export type StorageCacheOptions = {
  storage?: Storage;
  key?: string;
  ttlMs?: number;
  now?: () => number;
};

export type StorageCache<T> = {
  get: (name: string) => Promise<T | null>;
  set: (name: string, value: T, ttlMs?: number) => Promise<void>;
  remove: (name: string) => Promise<void>;
  clear: () => Promise<void>;
  readAll: () => Promise<Record<string, CacheEntry<T>>>;
};

export function isExpired(entry: CacheEntry<unknown>, now = Date.now()): boolean {
  return entry.expiresAt !== null && entry.expiresAt <= now;
}

// Namespaced TTL cache over any Storage. Expired entries are evicted lazily on read.
export function createStorageCache<T>(options: StorageCacheOptions = {}): StorageCache<T> {
  const storage = options.storage ?? createMemoryStorage();
  const key = options.key ?? CACHE_KEY;
  const now = options.now ?? Date.now;

  async function readAll(): Promise<Record<string, CacheEntry<T>>> {
    return (await storage.get<Record<string, CacheEntry<T>>>(key)) ?? {};
  }

  async function writeAll(entries: Record<string, CacheEntry<T>>): Promise<void> {
    await storage.set(key, entries);
  }

  async function remove(name: string): Promise<void> {
    const entries = await readAll();
    delete entries[name];
    await writeAll(entries);
  }

  async function get(name: string): Promise<T | null> {
    const entry = (await readAll())[name];
    if (!entry) return null;
    if (isExpired(entry, now())) {
      await remove(name);
      return null;
    }
    return entry.value;
  }

  return {
    get,
    async set(name, value, ttlMs = options.ttlMs) {
      const entries = await readAll();
      entries[name] = { value, expiresAt: ttlMs === undefined ? null : now() + ttlMs };
      await writeAll(entries);
    },
    remove,
    clear: () => storage.remove(key),
    readAll,
  };
}
