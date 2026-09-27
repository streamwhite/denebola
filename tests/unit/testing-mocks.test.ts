import { describe, expect, it } from "vitest";
import { createMemoryPermissionHandle } from "@/lib/permissions/registry";
import { createMockFetch } from "@/lib/testing/mockFetch";
import { createMockEventBridge, createMockNativeModule } from "@/lib/testing/mockNative";
import { createMockPermissionService } from "@/lib/testing/mockPermissions";
import { createMockStorage } from "@/lib/testing/mockStorage";

describe("createMockFetch", () => {
  it("returns json responses from the handler", async () => {
    const mockFetch = createMockFetch((request) => ({ body: { method: request.method, url: request.url } }));

    const response = await mockFetch("https://api.test/users", { method: "POST" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ method: "POST", url: "https://api.test/users" });
  });
});

describe("createMockStorage", () => {
  it("records every storage operation", async () => {
    const storage = createMockStorage({ a: 1 });

    await storage.get("a");
    await storage.set("b", 2);
    await storage.remove("a");
    await storage.clear();

    expect(storage.operations().map((entry) => entry.operation)).toEqual(["get", "set", "remove", "clear"]);
  });
});

describe("createMockPermissionService", () => {
  it("records permission requests", async () => {
    const service = createMockPermissionService({ camera: createMemoryPermissionHandle() });

    expect(await service.request("camera")).toBe("granted");
    expect(service.requests()).toEqual(["camera"]);
  });
});

describe("mock native re-exports", () => {
  it("provides a native module and event bridge", async () => {
    const module = createMockNativeModule({ ping: () => "pong" });

    expect(await module.call("ping")).toBe("pong");
    expect(typeof createMockEventBridge().addListener).toBe("function");
  });
});
