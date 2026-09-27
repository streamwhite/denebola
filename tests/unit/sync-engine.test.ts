import { describe, expect, it, vi } from "vitest";
import { createSyncEngine } from "@/lib/offline/sync";
import { createSyncQueue } from "@/lib/offline/queue";

type Job = { id: string };

describe("createSyncEngine", () => {
  it("flushes the queue when online and returns to idle", async () => {
    const process = vi.fn(async () => undefined);
    const queue = createSyncQueue<Job>({ process });
    queue.enqueue({ id: "1" });
    const engine = createSyncEngine({ queue, isOnline: () => true });

    expect(await engine.flush()).toBe(1);
    expect(engine.getStatus()).toBe("idle");
    expect(process).toHaveBeenCalledOnce();
  });

  it("skips flushing while offline", async () => {
    const process = vi.fn(async () => undefined);
    const queue = createSyncQueue<Job>({ process });
    queue.enqueue({ id: "1" });
    const engine = createSyncEngine({ queue, isOnline: () => false });

    expect(await engine.flush()).toBe(0);
    expect(engine.getStatus()).toBe("offline");
    expect(process).not.toHaveBeenCalled();
  });

  it("reports errors when the queue flush rejects", async () => {
    const queue = {
      enqueue: () => "1",
      list: () => [],
      remove: () => undefined,
      clear: () => undefined,
      refresh: async () => [],
      flush: async () => Promise.reject(new Error("boom")),
    };
    const onError = vi.fn();
    const engine = createSyncEngine({ queue, onError });

    expect(await engine.flush()).toBe(0);
    expect(engine.getStatus()).toBe("error");
    expect(onError).toHaveBeenCalledOnce();
  });

  it("flushes on the next online event after start and stops listening", async () => {
    let online = false;
    const subscription: { notify?: () => void } = {};
    const unsubscribe = vi.fn(() => {
      subscription.notify = undefined;
    });
    const process = vi.fn(async () => undefined);
    const queue = createSyncQueue<Job>({ process });
    queue.enqueue({ id: "1" });
    const engine = createSyncEngine({
      queue,
      isOnline: () => online,
      subscribeOnline: (notify) => {
        subscription.notify = notify;
        return unsubscribe;
      },
    });

    engine.start();
    expect(engine.getStatus()).toBe("offline");

    online = true;
    subscription.notify?.();
    await vi.waitFor(() => expect(process).toHaveBeenCalledOnce());

    engine.stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
