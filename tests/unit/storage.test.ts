import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("storage", () => {
  it("stores and removes JSON values", async () => {
    const storage = createMemoryStorage();
    await storage.set("settings", { locale: "zh-CN" });

    expect(await storage.get<{ locale: string }>("settings")).toEqual({ locale: "zh-CN" });
    await storage.remove("settings");
    expect(await storage.get("settings")).toBeNull();
  });
});
