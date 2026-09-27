import type { Storage } from "../storage/types";
import type { LogEntry, LogSink } from "./types";

const DEFAULT_MAX_ENTRIES = 500;
const DEFAULT_LOG_KEY = "app.logs";

export type MemoryLogSink = LogSink & { entries: () => LogEntry[]; clear: () => void };

export function createMemoryLogSink(options: { maxEntries?: number } = {}): MemoryLogSink {
  const max = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const buffer: LogEntry[] = [];
  return {
    write(entry) {
      buffer.push(entry);
      if (buffer.length > max) buffer.splice(0, buffer.length - max);
    },
    entries: () => [...buffer],
    clear: () => {
      buffer.length = 0;
    },
  };
}

export function formatLogEntries(entries: readonly LogEntry[]): string {
  return entries.map((entry) => JSON.stringify(entry)).join("\n");
}

export type PersistentLogSink = MemoryLogSink & { restore: () => Promise<LogEntry[]>; flush: () => Promise<void> };

export function createPersistentLogSink(options: { storage: Storage; key?: string; maxEntries?: number }): PersistentLogSink {
  const key = options.key ?? DEFAULT_LOG_KEY;
  const memory = createMemoryLogSink({ maxEntries: options.maxEntries });
  return {
    ...memory,
    clear: () => {
      memory.clear();
      void options.storage.remove(key).catch(() => undefined);
    },
    restore: async () => {
      const saved = await options.storage.get<LogEntry[]>(key);
      for (const entry of saved ?? []) memory.write(entry);
      return memory.entries();
    },
    flush: async () => {
      await options.storage.set(key, memory.entries());
    },
  };
}
