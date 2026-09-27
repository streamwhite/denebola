import * as SecureStore from "expo-secure-store";
import type { Storage } from "./types";

export const SECURE_INDEX_KEY = "secure.index";

const index = new Map<string, true>();

async function recordKey(key: string): Promise<void> {
  index.set(key, true);
  await SecureStore.setItemAsync(SECURE_INDEX_KEY, JSON.stringify([...index.keys()]));
}

async function forgetKey(key: string): Promise<void> {
  index.delete(key);
  await SecureStore.setItemAsync(SECURE_INDEX_KEY, JSON.stringify([...index.keys()]));
}

async function loadIndex(): Promise<void> {
  if (index.size > 0) return;
  const saved = await SecureStore.getItemAsync(SECURE_INDEX_KEY).catch(() => null);
  if (saved) for (const key of JSON.parse(saved) as string[]) index.set(key, true);
}

// Secure key-value storage backed by the OS keychain. Tracks its own keys so `clear()` can
// delete exactly the values this app wrote (SecureStore has no wipe-all API).
export const secureStorage: Storage = {
  async get<T>(key: string) {
    const value = await SecureStore.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : null;
  },
  async set<T>(key: string, value: T) {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    await recordKey(key);
  },
  async remove(key: string) {
    await SecureStore.deleteItemAsync(key);
    await forgetKey(key);
  },
  async clear() {
    await loadIndex();
    await Promise.all([...index.keys()].map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)));
    index.clear();
    await SecureStore.deleteItemAsync(SECURE_INDEX_KEY).catch(() => undefined);
  },
};
