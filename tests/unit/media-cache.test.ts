import { describe, expect, it } from "vitest";
import { createMediaCache } from "@/lib/media/cache";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("createMediaCache", () => {
  it("caches a source uri to a local uri and invalidates it", async () => {
    const cache = createMediaCache({ storage: createMemoryStorage() });
    const source = "https://cdn.example/a.jpg";

    expect(await cache.get(source)).toBeNull();

    await cache.set(source, "file:///cache/a.jpg");
    expect(await cache.get(source)).toBe("file:///cache/a.jpg");

    await cache.remove(source);
    expect(await cache.get(source)).toBeNull();
  });

  it("clears the whole cache", async () => {
    const cache = createMediaCache({ storage: createMemoryStorage() });
    await cache.set("a", "file:///a");
    await cache.set("b", "file:///b");

    await cache.clear();

    expect(await cache.get("a")).toBeNull();
    expect(await cache.get("b")).toBeNull();
  });
});
