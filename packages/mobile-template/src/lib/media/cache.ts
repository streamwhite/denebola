import { createStorageCache, type StorageCache } from "../storage/cache";
import type { Storage } from "../storage/types";

export const MEDIA_CACHE_KEY = "app.mediaCache";

export type MediaCacheOptions = { storage?: Storage; key?: string; ttlMs?: number };
export type MediaCache = StorageCache<string>;

// Maps a remote image uri to its locally cached uri so lists reuse downloads.
export function createMediaCache(options: MediaCacheOptions = {}): MediaCache {
  return createStorageCache<string>({ storage: options.storage, key: options.key ?? MEDIA_CACHE_KEY, ttlMs: options.ttlMs });
}
