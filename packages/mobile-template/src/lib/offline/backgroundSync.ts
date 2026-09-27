import type { BackgroundTaskAdapter, BackgroundTaskOptions } from "../background/types";
import type { SyncQueue } from "./queue";

export type BackgroundSync<T> = {
  task: BackgroundTaskOptions;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  runOnce: () => Promise<number>;
};

export const BACKGROUND_SYNC_TASK = "mobile-template.sync";
export const DEFAULT_MINIMUM_INTERVAL_MS = 15 * 60 * 1_000;

export type BackgroundSyncOptions<T> = {
  adapter: BackgroundTaskAdapter;
  queue: SyncQueue<T>;
  minimumIntervalMs?: number;
};

// Bridges the offline queue to a host background scheduler (expo-background-task /
// expo-task-manager). The adapter is injected so no native task dependency is imposed.
export function createBackgroundSync<T>({ adapter, queue, minimumIntervalMs = DEFAULT_MINIMUM_INTERVAL_MS }: BackgroundSyncOptions<T>): BackgroundSync<T> {
  const task: BackgroundTaskOptions = { name: BACKGROUND_SYNC_TASK, minimumIntervalMs, requiresNetwork: true };
  const runOnce = (): Promise<number> => queue.flush();

  return {
    task,
    async enable() {
      await adapter.register(task, async () => {
        await runOnce();
      });
    },
    disable: () => adapter.unregister(task.name),
    runOnce,
  };
}
