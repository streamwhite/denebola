import { describe, expect, it, vi } from "vitest";
import { createMemoryBackgroundFetchAdapter, createMemoryBackgroundLocationAdapter, createMemoryBackgroundTaskAdapter } from "@/lib/background/memory";
import { createTaskScheduler } from "@/lib/background/scheduler";

describe("createTaskScheduler", () => {
  it("registers, runs and cancels a task", async () => {
    const adapter = createMemoryBackgroundTaskAdapter();
    const scheduler = createTaskScheduler(adapter);
    const run = vi.fn(async () => undefined);

    await scheduler.register({ name: "sync", run });
    expect(scheduler.isRunning("sync")).toBe(true);
    expect(adapter.registered()).toEqual(["sync"]);

    await adapter.run("sync");
    expect(run).toHaveBeenCalledOnce();

    await scheduler.cancel("sync");
    expect(scheduler.isRunning("sync")).toBe(false);
  });

  it("cancels every registered task", async () => {
    const adapter = createMemoryBackgroundTaskAdapter();
    const scheduler = createTaskScheduler(adapter);

    await scheduler.register({ name: "a", run: async () => undefined });
    await scheduler.register({ name: "b", run: async () => undefined });
    await scheduler.cancelAll();

    expect(scheduler.running()).toEqual([]);
    expect(adapter.registered()).toEqual([]);
  });
});

describe("background fetch adapter", () => {
  it("registers, runs and unregisters a fetch", async () => {
    const adapter = createMemoryBackgroundFetchAdapter();
    const run = vi.fn(async () => undefined);

    await adapter.register(run, { minimumIntervalMs: 1_000 });
    expect(adapter.registered()).toBe(true);

    await adapter.run();
    expect(run).toHaveBeenCalledOnce();

    await adapter.unregister();
    expect(adapter.registered()).toBe(false);
  });
});

describe("background location adapter", () => {
  it("streams samples until stopped", async () => {
    const adapter = createMemoryBackgroundLocationAdapter();
    const listener = vi.fn();

    await adapter.start(listener);
    adapter.emit({ latitude: 1, longitude: 2, timestamp: 3 });
    expect(listener).toHaveBeenCalledWith({ latitude: 1, longitude: 2, timestamp: 3 });

    await adapter.stop();
    adapter.emit({ latitude: 4, longitude: 5, timestamp: 6 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
