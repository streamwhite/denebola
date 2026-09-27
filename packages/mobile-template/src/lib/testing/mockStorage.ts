import type { Storage } from "../storage/types";

export type StorageOperation = { operation: "get" | "set" | "remove" | "clear"; key?: string };

// Storage that records every operation, for asserting cache/persistence behavior in tests.
export function createMockStorage(initial: Record<string, unknown> = {}): Storage & { operations: () => StorageOperation[] } {
  const values = new Map<string, unknown>(Object.entries(initial));
  const operations: StorageOperation[] = [];
  return {
    operations: () => operations.map((entry) => ({ ...entry })),
    async get<T>(key: string): Promise<T | null> {
      operations.push({ operation: "get", key });
      return (values.get(key) as T | undefined) ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      operations.push({ operation: "set", key });
      values.set(key, value);
    },
    async remove(key: string): Promise<void> {
      operations.push({ operation: "remove", key });
      values.delete(key);
    },
    async clear(): Promise<void> {
      operations.push({ operation: "clear" });
      values.clear();
    },
  };
}
