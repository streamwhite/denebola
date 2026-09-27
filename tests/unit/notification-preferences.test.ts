import { describe, expect, it } from "vitest";
import { createNotificationPreferences, isNotificationTypeEnabled } from "@/lib/notifications/preferences";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("notification preferences", () => {
  it("defaults to enabled with every type on", async () => {
    const preferences = createNotificationPreferences();

    expect(await preferences.get("enabled")).toBe(true);
    expect(isNotificationTypeEnabled(await preferences.read(), "message")).toBe(true);
  });

  it("honors per-type overrides and the master switch", async () => {
    const preferences = createNotificationPreferences(createMemoryStorage());

    await preferences.patch({ types: { message: false } });
    expect(isNotificationTypeEnabled(await preferences.read(), "message")).toBe(false);
    expect(isNotificationTypeEnabled(await preferences.read(), "promo")).toBe(true);

    await preferences.patch({ enabled: false });
    expect(isNotificationTypeEnabled(await preferences.read(), "promo")).toBe(false);
  });
});
