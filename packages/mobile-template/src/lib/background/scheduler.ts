import type { BackgroundTaskAdapter, BackgroundTaskOptions, BackgroundTaskRunner } from "./types";

export type ScheduledTask = {
  name: string;
  run: BackgroundTaskRunner;
  options?: Omit<BackgroundTaskOptions, "name">;
};

export type TaskScheduler = {
  register: (task: ScheduledTask) => Promise<void>;
  cancel: (name: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  isRunning: (name: string) => boolean;
  running: () => string[];
};

// Tracks which tasks are registered so cancellation and diagnostics need no adapter-specific state.
export function createTaskScheduler(adapter: BackgroundTaskAdapter): TaskScheduler {
  const active = new Set<string>();

  return {
    async register({ name, run, options }) {
      await adapter.register({ name, ...options }, run);
      active.add(name);
    },
    async cancel(name) {
      await adapter.unregister(name);
      active.delete(name);
    },
    async cancelAll() {
      await Promise.all([...active].map((name) => adapter.unregister(name)));
      active.clear();
    },
    isRunning: (name) => active.has(name),
    running: () => [...active],
  };
}
