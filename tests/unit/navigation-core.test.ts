import { describe, expect, it } from "vitest";
import { buildDeepLink, buildPath, buildUniversalLink, isRouteActive, isUniversalLink, routeKey } from "@/lib/navigation/navigationCore";

describe("buildPath", () => {
  it("appends defined query params and skips empty values", () => {
    expect(buildPath("/orders", { page: 2, q: "ada", cursor: null })).toBe("/orders?page=2&q=ada");
    expect(buildPath("/orders")).toBe("/orders");
  });

  it("appends with & when the path already has a query", () => {
    expect(buildPath("/orders?tab=all", { page: 1 })).toBe("/orders?tab=all&page=1");
  });
});

describe("buildDeepLink", () => {
  it("builds a custom scheme url that parseDeepLink resolves", () => {
    expect(buildDeepLink("myapp", "/profile/123")).toBe("myapp://profile/123");
    expect(buildDeepLink("myapp", "orders", { page: 2 })).toBe("myapp://orders?page=2");
  });
});

describe("universal links", () => {
  it("builds https links", () => {
    expect(buildUniversalLink("example.com", "/orders/42")).toBe("https://example.com/orders/42");
    expect(buildUniversalLink("example.com", "orders")).toBe("https://example.com/orders");
  });

  it("accepts the host and its subdomains, rejects other hosts and schemes", () => {
    expect(isUniversalLink("https://example.com/orders", ["example.com"])).toBe(true);
    expect(isUniversalLink("https://app.example.com/orders", ["example.com"])).toBe(true);
    expect(isUniversalLink("https://evil.com/orders", ["example.com"])).toBe(false);
    expect(isUniversalLink("myapp://orders", ["example.com"])).toBe(false);
  });
});

describe("isRouteActive / routeKey", () => {
  it("matches exact and nested routes, ignoring trailing slashes", () => {
    expect(isRouteActive("/orders", "/orders")).toBe(true);
    expect(isRouteActive("/orders/42", "/orders")).toBe(true);
    expect(isRouteActive("/orders/", "/orders")).toBe(true);
    expect(isRouteActive("/orders-old", "/orders")).toBe(false);
  });

  it("builds a key from segments, dropping empty ones", () => {
    expect(routeKey(["(tabs)", "orders", ""])).toBe("(tabs)/orders");
  });
});
