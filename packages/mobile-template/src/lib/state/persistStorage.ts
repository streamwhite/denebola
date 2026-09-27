import type { Storage } from "../storage/types";

export type StateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

export type AsyncStateStorage = {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
};

export const STATE_STORAGE_PREFIX = "state:";

function scopedKey(name: string): string {
  return `${STATE_STORAGE_PREFIX}${name}`;
}

// Zustand's `createJSONStorage` awaits a sync getItem only during hydration on web; on native
// it accepts an async storage. This adapts our Storage interface (which returns objects) to
// the string-based contract Zustand's persist middleware expects.
export function createZustandStorage(storage: Storage): AsyncStateStorage {
  return {
    getItem: async (name) => {
      const value = await storage.get<unknown>(scopedKey(name));
      return value === null || value === undefined ? null : JSON.stringify(value);
    },
    setItem: async (name, value) => {
      await storage.set(scopedKey(name), JSON.parse(value));
    },
    removeItem: (name) => storage.remove(scopedKey(name)),
  };
}

export function resetStateStorage(storage: Storage): Promise<void> {
  return storage.clear();
}
