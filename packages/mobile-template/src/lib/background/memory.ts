import type { BackgroundFetchAdapter, BackgroundLocationAdapter, BackgroundTaskAdapter, BackgroundTaskRunner, LocationSample } from "./types";

// In-memory background task adapter for tests and local development.
export function createMemoryBackgroundTaskAdapter(): BackgroundTaskAdapter & { run: (name: string) => Promise<void>; registered: () => string[] } {
  const tasks = new Map<string, BackgroundTaskRunner>();
  return {
    async register(options: { name: string }, run: BackgroundTaskRunner): Promise<void> {
      tasks.set(options.name, run);
    },
    async unregister(name: string): Promise<void> {
      tasks.delete(name);
    },
    async run(name: string): Promise<void> {
      await tasks.get(name)?.();
    },
    registered: () => [...tasks.keys()],
  };
}

export function createMemoryBackgroundFetchAdapter(): BackgroundFetchAdapter & { run: () => Promise<void>; registered: () => boolean } {
  const state: { run?: BackgroundTaskRunner } = {};
  return {
    async register(run: BackgroundTaskRunner): Promise<void> {
      state.run = run;
    },
    async unregister(): Promise<void> {
      state.run = undefined;
    },
    async run(): Promise<void> {
      await state.run?.();
    },
    registered: () => state.run !== undefined,
  };
}

export function createMemoryBackgroundLocationAdapter(): BackgroundLocationAdapter & { emit: (sample: LocationSample) => void; isActive: () => boolean } {
  const state: { listener?: (sample: LocationSample) => void } = {};
  return {
    async start(listener: (sample: LocationSample) => void): Promise<void> {
      state.listener = listener;
    },
    async stop(): Promise<void> {
      state.listener = undefined;
    },
    emit(sample: LocationSample): void {
      state.listener?.(sample);
    },
    isActive: () => state.listener !== undefined,
  };
}

// Contract check: the memory task adapter is interchangeable with a native one.
export type MemoryBackgroundTaskAdapter = BackgroundTaskAdapter;
