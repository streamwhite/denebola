import type { FileKind, FileStore } from "./files";
import { createStorageCache } from "../storage/cache";
import type { Storage } from "../storage/types";

export const FILE_CACHE_KEY = "app.fileCache";

export type FileCacheOptions = {
  store: FileStore;
  storage?: Storage;
  key?: string;
  ttlMs?: number;
  kind?: FileKind;
};

export type FileCache = {
  resolve: (url: string) => Promise<string>;
  invalidate: (url: string) => Promise<void>;
  clear: () => Promise<void>;
};

// Downloads a remote file once, reuses the local uri until the TTL expires, and keeps the store
// in sync when entries are invalidated or cleared.
export function createFileCache({ store, storage, key = FILE_CACHE_KEY, ttlMs, kind = "cache" }: FileCacheOptions): FileCache {
  const cache = createStorageCache<string>({ storage, key, ttlMs });

  return {
    async resolve(url) {
      const cached = await cache.get(url);
      if (cached) return cached;
      const uri = await store.download(url, kind);
      await cache.set(url, uri);
      return uri;
    },
    async invalidate(url) {
      const uri = await cache.get(url);
      await cache.remove(url);
      if (uri) await store.remove(uri);
    },
    async clear() {
      const entries = await cache.readAll();
      await Promise.all(Object.values(entries).map((entry) => store.remove(entry.value)));
      await cache.clear();
    },
  };
}
