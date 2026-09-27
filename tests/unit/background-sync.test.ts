import { describe, expect, it, vi } from "vitest";
import type { BackgroundTaskAdapter } from "@/lib/background/types";
import { createBackgroundSync } from "@/lib/offline/backgroundSync";
import { createSyncQueue } from "@/lib/offline/queue";

type Job = { id: string };

describe("createBackgroundSync", () => {
  it("registers the sync task, flushes the queue and unregisters", async () => {
    const process = vi.fn(async () => undefined);
    const queue = createSyncQueue<Job>({ process });
    queue.enqueue({ id: "1" });
    const adapter: BackgroundTaskAdapter = {
      register: vi.fn(async () => undefined),
      unregister: vi.fn(async () => undefined),
    };
    const background = createBackgroundSync({ adapter, queue });

    await background.enable();
    expect(adapter.register).toHaveBeenCalledOnce();
    expect(background.task.requiresNetwork).toBe(true);

    expect(await background.runOnce()).toBe(1);

    await background.disable();
    expect(adapter.unregister).toHaveBeenCalledOnce();
  });
});
