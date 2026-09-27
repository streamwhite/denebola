import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { createQueryKeys } from "@/lib/query/keys";
import { createQueryPersister, QUERY_CACHE_BUSTER } from "@/lib/query/persister";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

const orders = createQueryKeys("orders");

describe("createQueryPersister", () => {
  it("persists cached queries and restores them into a fresh client", async () => {
    const storage = createMemoryStorage();
    const source = new QueryClient();
    source.setQueryData(orders.detail("1"), { id: "1", status: "open" });

    await createQueryPersister(storage).persist(source);

    const target = new QueryClient();
    const restored = await createQueryPersister(storage).restore(target);

    expect(restored).toBe(1);
    expect(target.getQueryData(orders.detail("1"))).toEqual({ id: "1", status: "open" });
  });

  it("ignores a cache written by an incompatible buster", async () => {
    const storage = createMemoryStorage();
    await storage.set("app.queryCache", { buster: "stale", timestamp: 0, clientState: [] });

    const restored = await createQueryPersister(storage).restore(new QueryClient());

    expect(restored).toBe(0);
    expect(QUERY_CACHE_BUSTER).toBe("1");
  });

  it("clears the persisted cache", async () => {
    const storage = createMemoryStorage();
    const source = new QueryClient();
    source.setQueryData(orders.all, { ok: true });
    await createQueryPersister(storage).persist(source);

    await createQueryPersister(storage).clear();

    expect(await storage.get("app.queryCache")).toBeNull();
  });
});
