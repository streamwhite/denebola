import { describe, expect, it, vi } from "vitest";
import { normalizeNativeConfig, requestedNativePermissions } from "@/lib/native/config";
import { createMemoryEventBridge } from "@/lib/native/events";
import { createMemoryNativeModule } from "@/lib/native/module";

describe("native module adapter", () => {
  it("calls registered methods and records calls", async () => {
    const module = createMemoryNativeModule({ greet: (name) => `hi ${name}` });

    expect(module.has("greet")).toBe(true);
    expect(await module.call("greet", "a")).toBe("hi a");
    expect(module.calls()).toEqual([{ method: "greet", args: ["a"] }]);
  });

  it("rejects unknown methods", async () => {
    const module = createMemoryNativeModule();
    await expect(module.call("missing")).rejects.toThrow("Unknown native method");
  });
});

describe("native event bridge", () => {
  it("delivers events and supports unsubscribe", () => {
    const bridge = createMemoryEventBridge();
    const seen: number[] = [];
    const unsubscribe = bridge.addListener<number>("tick", (value) => seen.push(value));

    bridge.emit("tick", 1);
    unsubscribe();
    bridge.emit("tick", 2);

    expect(seen).toEqual([1]);
  });

  it("removes listeners by event or all at once", () => {
    const bridge = createMemoryEventBridge();
    const listener = vi.fn();
    bridge.addListener("a", listener);

    bridge.removeAllListeners();

    bridge.emit("a", {});
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("native config", () => {
  it("normalizes permission and build configuration", () => {
    const config = normalizeNativeConfig({ permissions: { camera: "Camera access" }, build: { bundleIdentifier: "com.example.app" } });

    expect(config.modules).toEqual([]);
    expect(config.build.bundleIdentifier).toBe("com.example.app");
    expect(requestedNativePermissions(config)).toEqual(["camera"]);
  });
});
