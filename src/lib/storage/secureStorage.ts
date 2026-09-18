import * as SecureStore from "expo-secure-store";
import type { Storage } from "@/lib/storage/types";

export const secureStorage: Storage = {
  async get<T>(key: string) {
    const value = await SecureStore.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : null;
  },
  async set<T>(key: string, value: T) { await SecureStore.setItemAsync(key, JSON.stringify(value)); },
  async remove(key: string) { await SecureStore.deleteItemAsync(key); },
  async clear() { throw new Error("Secure storage does not support global clear"); },
};
