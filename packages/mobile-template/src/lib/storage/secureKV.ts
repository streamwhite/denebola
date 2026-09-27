import * as SecureStore from "expo-secure-store";
import type { Cipher } from "./crypto";
import { passthroughCipher } from "./crypto";

export type SecureStoreBackend = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  deleteItem: (key: string) => Promise<void>;
};

const backend: SecureStoreBackend = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

export function createSecureKV(options: { cipher?: Cipher; key?: string; store?: SecureStoreBackend } = {}) {
  const cipher = options.cipher ?? passthroughCipher;
  const masterKey = options.key ?? "secure.default";
  const store = options.store ?? backend;

  return {
    async get<T>(name: string): Promise<T | null> {
      const raw = await store.getItem(name);
      if (raw === null) return null;
      return JSON.parse(await cipher.decrypt(raw, masterKey)) as T;
    },
    async set<T>(name: string, value: T): Promise<void> {
      await store.setItem(name, await cipher.encrypt(JSON.stringify(value), masterKey));
    },
    // Secure delete: remove the value; callers should also rotate keys for high-value secrets.
    remove: (name: string) => store.deleteItem(name),
  };
}
