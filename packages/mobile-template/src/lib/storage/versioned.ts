import { createMemoryStorage } from "./memoryStorage";
import type { Storage } from "./types";

export type VersionedPayload<T> = { version: number; data: T };

export type StorageMigration<T> = {
  version: number;
  migrate: (data: unknown) => T | Promise<T>;
};

export type VersionedStorageOptions<T> = {
  storage?: Storage;
  key: string;
  version: number;
  migrations?: StorageMigration<T>[];
};

export type VersionedStorage<T> = {
  read: () => Promise<T | null>;
  write: (data: T) => Promise<void>;
  clear: () => Promise<void>;
  version: number;
};

export async function migrateStoredValue<T>(data: unknown, from: number, to: number, migrations: StorageMigration<T>[] = []): Promise<T> {
  let value = data;
  for (const migration of [...migrations].sort((left, right) => left.version - right.version)) {
    if (migration.version <= from || migration.version > to) continue;
    value = await migration.migrate(value);
  }
  return value as T;
}

// Wraps a Storage key with a schema version. Reads are migrated up to the current version and
// rewritten; payloads written by a newer app version are ignored rather than downgraded.
export function createVersionedStorage<T>(options: VersionedStorageOptions<T>): VersionedStorage<T> {
  const storage = options.storage ?? createMemoryStorage();
  const { key, version } = options;
  const migrations = options.migrations ?? [];

  async function write(data: T): Promise<void> {
    await storage.set<VersionedPayload<T>>(key, { version, data });
  }

  return {
    version,
    async read(): Promise<T | null> {
      const payload = await storage.get<VersionedPayload<unknown>>(key);
      if (!payload || payload.version > version) return null;
      if (payload.version === version) return payload.data as T;
      const data = await migrateStoredValue(payload.data, payload.version, version, migrations);
      await write(data);
      return data;
    },
    write,
    clear: () => storage.remove(key),
  };
}
