import { describe, expect, it, vi } from "vitest";
import { createSyncQueue } from "@/lib/offline/queue";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("createSyncQueue", () => {
  it("enqueues, lists and removes items", () => {
    const queue = createSyncQueue<{ id: string }>();

    const id = queue.enqueue({ id: "1" });
    expect(queue.list()).toHaveLength(1);
    queue.remove(id);
    expect(queue.list()).toHaveLength(0);
  });

  it("persists and restores from storage", async () => {
    const storage = createMemoryStorage();
    const queue = createSyncQueue<{ id: string }>({ storage });
    queue.enqueue({ id: "1" });
    queue.enqueue({ id: "2" });

    const restored = createSyncQueue<{ id: string }>({ storage });
    await restored.refresh();

    expect(restored.list().map((item) => item.payload.id)).toEqual(["1", "2"]);
  });

  it("flushes queued items through the processor and drops them", async () => {
    const process = vi.fn(async () => undefined);
    const queue = createSyncQueue<{ id: string }>({ process });
    queue.enqueue({ id: "1" });
    queue.enqueue({ id: "2" });

    const processed = await queue.flush();

    expect(processed).toBe(2);
    expect(process).toHaveBeenCalledTimes(2);
    expect(queue.list()).toHaveLength(0);
  });

  it("increments attempts on failure and drops after maxAttempts", async () => {
    const queue = createSyncQueue<{ id: string }>({ process: async () => Promise.reject(new Error("offline")), maxAttempts: 2 });
    queue.enqueue({ id: "1" });

    await queue.flush();
    expect(queue.list()[0].attempts).toBe(1);

    await queue.flush();
    expect(queue.list()).toHaveLength(0);
  });
});
