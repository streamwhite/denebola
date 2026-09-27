import { describe, expect, it } from "vitest";
import { createStorageCache } from "@/lib/storage/cache";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("createStorageCache", () => {
  it("returns values before expiry and evicts them after", async () => {
    let now = 0;
    const cache = createStorageCache<number>({ storage: createMemoryStorage(), ttlMs: 100, now: () => now });

    await cache.set("a", 1);
    expect(await cache.get("a")).toBe(1);

    now = 200;
    expect(await cache.get("a")).toBeNull();
  });

  it("persists entries without a ttl and removes them explicitly", async () => {
    const storage = createMemoryStorage();
    const first = createStorageCache<string>({ storage });
    await first.set("token", "abc");

    const restored = createStorageCache<string>({ storage });
    expect(await restored.get("token")).toBe("abc");

    await restored.remove("token");
    expect(await restored.get("token")).toBeNull();
  });

  it("clears the whole namespace", async () => {
    const cache = createStorageCache<number>({ storage: createMemoryStorage() });
    await cache.set("a", 1);
    await cache.set("b", 2);

    await cache.clear();

    expect(await cache.readAll()).toEqual({});
  });
});
