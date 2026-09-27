import { describe, expect, it } from "vitest";
import { createPreferences } from "@/lib/storage/preferences";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("createPreferences", () => {
  it("merges stored values over defaults", async () => {
    const preferences = createPreferences({ storage: createMemoryStorage(), defaults: { theme: "system", locale: "en" } });

    expect(await preferences.get("theme")).toBe("system");

    await preferences.set("theme", "dark");
    expect(await preferences.read()).toEqual({ theme: "dark", locale: "en" });
  });

  it("patches several values at once and resets to defaults", async () => {
    const preferences = createPreferences({ storage: createMemoryStorage(), defaults: { theme: "system", locale: "en" } });

    await preferences.patch({ theme: "dark", locale: "zh-CN" });
    expect(await preferences.get("locale")).toBe("zh-CN");

    expect(await preferences.reset()).toEqual({ theme: "system", locale: "en" });
    expect(await preferences.get("theme")).toBe("system");
  });
});
