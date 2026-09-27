import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";
import { createVersionedStorage } from "@/lib/storage/versioned";

describe("createVersionedStorage", () => {
  it("migrates stored data up to the current version", async () => {
    const storage = createMemoryStorage();
    await storage.set("state", { version: 1, data: { name: "a" } });

    const versioned = createVersionedStorage<{ name: string; active: boolean }>({
      storage,
      key: "state",
      version: 2,
      migrations: [{ version: 2, migrate: (data) => ({ ...(data as { name: string }), active: true }) }],
    });

    expect(await versioned.read()).toEqual({ name: "a", active: true });
  });

  it("writes at the current version and reads it back", async () => {
    const versioned = createVersionedStorage<number>({ storage: createMemoryStorage(), key: "count", version: 3 });

    await versioned.write(7);

    expect(await versioned.read()).toBe(7);
  });

  it("ignores data written by a newer app version", async () => {
    const storage = createMemoryStorage();
    await storage.set("state", { version: 5, data: "future" });

    const versioned = createVersionedStorage<string>({ storage, key: "state", version: 2 });

    expect(await versioned.read()).toBeNull();
  });
});
