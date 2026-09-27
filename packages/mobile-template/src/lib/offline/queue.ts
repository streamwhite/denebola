import type { Storage } from "../storage/types";
import type { OfflineQueueItem } from "./state";

export type SyncQueue<T> = {
  enqueue: (payload: T) => string;
  list: () => OfflineQueueItem<T>[];
  remove: (id: string) => void;
  clear: () => void;
  refresh: () => Promise<OfflineQueueItem<T>[]>;
  flush: () => Promise<number>;
};

export type SyncQueueOptions<T> = {
  storage?: Storage;
  key?: string;
  process?: (payload: T) => Promise<void>;
  maxAttempts?: number;
};

export const DEFAULT_QUEUE_KEY = "app.offlineQueue";
export const DEFAULT_MAX_ATTEMPTS = 5;

function makeId(index: number): string {
  return `${Date.now().toString(36)}-${index.toString(36)}`;
}

export function createSyncQueue<T>(options: SyncQueueOptions<T> = {}): SyncQueue<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  let items: OfflineQueueItem<T>[] = [];

  async function persist(): Promise<void> {
    await options.storage?.set(options.key ?? DEFAULT_QUEUE_KEY, items);
  }

  async function refresh(): Promise<OfflineQueueItem<T>[]> {
    const saved = await options.storage?.get<OfflineQueueItem<T>[]>(options.key ?? DEFAULT_QUEUE_KEY);
    if (Array.isArray(saved)) items = saved;
    return [...items];
  }

  async function flush(): Promise<number> {
    if (!options.process) return 0;
    let processed = 0;
    for (const item of [...items]) {
      try {
        await options.process(item.payload);
        remove(item.id);
        processed += 1;
      } catch {
        item.attempts += 1;
        if (item.attempts >= maxAttempts) remove(item.id);
      }
    }
    await persist();
    return processed;
  }

  function remove(id: string): void {
    items = items.filter((item) => item.id !== id);
  }

  return {
    enqueue(payload) {
      const id = makeId(items.length);
      items = [...items, { id, payload, attempts: 0, createdAt: Date.now() }];
      void persist();
      return id;
    },
    list: () => [...items],
    remove: (id) => {
      remove(id);
      void persist();
    },
    clear: () => {
      items = [];
      void persist();
    },
    refresh,
    flush,
  };
}
