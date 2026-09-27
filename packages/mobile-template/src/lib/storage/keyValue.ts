import type { Storage } from "./types";

export type KeyValueBackend = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const KV_INDEX_KEY = "kv.__index__";

export function createMemoryKeyValueBackend(): KeyValueBackend {
  const values = new Map<string, string>();
  return {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
}

// Adapts a string backend (AsyncStorage, MMKV, expo-sqlite's kv store) to the Storage contract.
// The backend cannot list keys, so the adapter records its own keys to make `clear` exact.
export function createKeyValueStorage(backend: KeyValueBackend): Storage {
  const keys = new Set<string>();
  let loaded = false;

  async function load(): Promise<void> {
    if (loaded) return;
    loaded = true;
    const saved = await backend.getItem(KV_INDEX_KEY).catch(() => null);
    if (saved) for (const key of JSON.parse(saved) as string[]) keys.add(key);
  }

  async function persistIndex(): Promise<void> {
    await backend.setItem(KV_INDEX_KEY, JSON.stringify([...keys]));
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await backend.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    },
    async set<T>(key: string, value: T): Promise<void> {
      await load();
      await backend.setItem(key, JSON.stringify(value));
      keys.add(key);
      await persistIndex();
    },
    async remove(key: string): Promise<void> {
      await load();
      await backend.removeItem(key);
      keys.delete(key);
      await persistIndex();
    },
    async clear(): Promise<void> {
      await load();
      await Promise.all([...keys].map((key) => backend.removeItem(key)));
      keys.clear();
      await backend.removeItem(KV_INDEX_KEY);
    },
  };
}
