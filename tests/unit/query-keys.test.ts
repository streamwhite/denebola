import { describe, expect, it } from "vitest";
import { createQueryKeys, isQueryKeyInScope } from "@/lib/query/keys";

const orders = createQueryKeys("orders");

describe("createQueryKeys", () => {
  it("builds scoped list, infinite and detail keys", () => {
    expect(orders.all).toEqual(["orders"]);
    expect(orders.list({ page: 2 })).toEqual(["orders", "list", { page: 2 }]);
    expect(orders.infinite()).toEqual(["orders", "infinite", {}]);
    expect(orders.detail(42)).toEqual(["orders", "detail", 42]);
  });

  it("drops empty filter values so keys stay stable", () => {
    expect(orders.list({ page: 1, q: "", cursor: undefined, active: null })).toEqual(["orders", "list", { page: 1 }]);
  });
});

describe("isQueryKeyInScope", () => {
  it("matches keys by their first segment", () => {
    expect(isQueryKeyInScope(["orders", "list"], "orders")).toBe(true);
    expect(isQueryKeyInScope(["users"], "orders")).toBe(false);
    expect(isQueryKeyInScope(undefined, "orders")).toBe(false);
  });
});
