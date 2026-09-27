import { describe, expect, it } from "vitest";
import { createKeyValueStorage, createMemoryKeyValueBackend } from "@/lib/storage/keyValue";

describe("createKeyValueStorage", () => {
  it("stores and reads JSON values through a string backend", async () => {
    const storage = createKeyValueStorage(createMemoryKeyValueBackend());
    await storage.set("settings", { locale: "zh-CN" });

    expect(await storage.get<{ locale: string }>("settings")).toEqual({ locale: "zh-CN" });
    expect(await storage.get("missing")).toBeNull();
  });

  it("clears only the keys it wrote", async () => {
    const backend = createMemoryKeyValueBackend();
    await backend.setItem("external", "keep");
    const storage = createKeyValueStorage(backend);
    await storage.set("a", 1);
    await storage.set("b", 2);

    await storage.clear();

    expect(await storage.get("a")).toBeNull();
    expect(await storage.get("b")).toBeNull();
    expect(await backend.getItem("external")).toBe("keep");
  });

  it("restores and removes keys across instances", async () => {
    const backend = createMemoryKeyValueBackend();
    await createKeyValueStorage(backend).set("a", 1);

    const restored = createKeyValueStorage(backend);
    expect(await restored.get("a")).toBe(1);

    await restored.clear();
    expect(await createKeyValueStorage(backend).get("a")).toBeNull();
  });
});
