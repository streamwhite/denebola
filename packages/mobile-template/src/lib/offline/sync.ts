import type { SyncQueue } from "./queue";

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

export type SyncEngineOptions<T> = {
  queue: SyncQueue<T>;
  isOnline?: () => boolean;
  subscribeOnline?: (listener: () => void) => () => void;
  onStatus?: (status: SyncStatus) => void;
  onError?: (error: unknown) => void;
};

export type SyncEngine = {
  start: () => void;
  stop: () => void;
  flush: () => Promise<number>;
  getStatus: () => SyncStatus;
};

// Drains an offline queue through its own processor, driven by `queue.flush()`. Connectivity is
// injected so the engine stays independent of the network layer; reconnect triggers a flush.
export function createSyncEngine<T>(options: SyncEngineOptions<T>): SyncEngine {
  const { queue, isOnline = () => true, subscribeOnline, onStatus, onError } = options;
  let status: SyncStatus = "idle";
  let unsubscribe: (() => void) | null = null;

  function update(next: SyncStatus): void {
    status = next;
    onStatus?.(next);
  }

  async function flush(): Promise<number> {
    if (!isOnline()) {
      update("offline");
      return 0;
    }
    update("syncing");
    try {
      const processed = await queue.flush();
      update("idle");
      return processed;
    } catch (error) {
      update("error");
      onError?.(error);
      return 0;
    }
  }

  return {
    flush,
    start() {
      if (unsubscribe) return;
      unsubscribe = subscribeOnline?.(() => void flush()) ?? null;
      void flush();
    },
    stop() {
      unsubscribe?.();
      unsubscribe = null;
    },
    getStatus: () => status,
  };
}
