import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { appendInfinitePage, invalidateScope, optimisticDetailUpdate, optimisticListUpdate, prefetchQuery, rollbackQueries } from "@/lib/query/cache";
import { createQueryKeys } from "@/lib/query/keys";

const orders = createQueryKeys("orders");
type Order = { id: string; status: string };
type ListCache = { items: Order[]; total: number };

function seeded() {
  const client = new QueryClient();
  client.setQueryData(orders.list(), { items: [{ id: "1", status: "open" }], total: 1 });
  client.setQueryData(orders.detail("1"), { id: "1", status: "open" });
  return client;
}

describe("optimisticListUpdate", () => {
  it("applies the update to cached lists and can roll back", () => {
    const client = seeded();

    const snapshot = optimisticListUpdate<Order>(client, "orders", (items) => items.map((item) => ({ ...item, status: "done" })));
    expect((client.getQueryData(orders.list()) as ListCache).items[0].status).toBe("done");

    rollbackQueries(client, snapshot);
    expect((client.getQueryData(orders.list()) as ListCache).items[0].status).toBe("open");
  });
});

describe("optimisticDetailUpdate", () => {
  it("updates a detail entry and rolls back", () => {
    const client = seeded();

    const snapshot = optimisticDetailUpdate<Order>(client, orders.detail("1"), (current) => (current ? { ...current, status: "closed" } : current));
    expect((client.getQueryData(orders.detail("1")) as Order).status).toBe("closed");

    rollbackQueries(client, snapshot);
    expect((client.getQueryData(orders.detail("1")) as Order).status).toBe("open");
  });
});

describe("prefetchQuery", () => {
  it("stores the prefetched value in the cache", async () => {
    const client = new QueryClient();

    await prefetchQuery(client, orders.detail("2"), async () => ({ id: "2", status: "new" }));

    expect(client.getQueryData(orders.detail("2"))).toEqual({ id: "2", status: "new" });
  });
});

describe("invalidateScope", () => {
  it("marks scoped queries stale", async () => {
    const client = seeded();

    await invalidateScope(client, "orders");

    expect(client.getQueryState(orders.list())?.isInvalidated).toBe(true);
  });
});

describe("appendInfinitePage", () => {
  it("appends pages and page params", () => {
    expect(appendInfinitePage<number>(undefined, 1, 0)).toEqual({ pages: [1], pageParams: [0] });
    expect(appendInfinitePage({ pages: [1], pageParams: [0] }, 2, 1)).toEqual({ pages: [1, 2], pageParams: [0, 1] });
  });
});
