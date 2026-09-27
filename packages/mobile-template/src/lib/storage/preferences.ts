import { createMemoryStorage } from "./memoryStorage";
import type { Storage } from "./types";

export type PreferenceValues = Record<string, unknown>;

export const PREFERENCES_KEY = "app.preferences";

export type PreferencesOptions<T extends PreferenceValues> = {
  storage?: Storage;
  key?: string;
  defaults: T;
};

export type Preferences<T extends PreferenceValues> = {
  read: () => Promise<T>;
  get: <K extends keyof T>(name: K) => Promise<T[K]>;
  set: <K extends keyof T>(name: K, value: T[K]) => Promise<T>;
  patch: (partial: Partial<T>) => Promise<T>;
  reset: () => Promise<T>;
};

// Typed preferences layered over one Storage key: stored values win, defaults fill the rest.
export function createPreferences<T extends PreferenceValues>(options: PreferencesOptions<T>): Preferences<T> {
  const storage = options.storage ?? createMemoryStorage();
  const key = options.key ?? PREFERENCES_KEY;
  const defaults = options.defaults;

  async function read(): Promise<T> {
    const saved = await storage.get<Partial<T>>(key);
    return { ...defaults, ...(saved ?? {}) };
  }

  async function patch(partial: Partial<T>): Promise<T> {
    const next = { ...(await read()), ...partial };
    await storage.set(key, next);
    return next;
  }

  return {
    read,
    get: (name) => read().then((values) => values[name]),
    set: (name, value) => patch({ [name]: value } as unknown as Partial<T>),
    patch,
    async reset() {
      await storage.remove(key);
      return { ...defaults };
    },
  };
}
