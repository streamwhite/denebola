import { describe, expect, it } from "vitest";
import { createAccessibilityPreferences, createMemoryAccessibilityAdapter, DEFAULT_ACCESSIBILITY_PREFERENCES, prefersReducedMotion } from "@/lib/preferences/accessibility";
import { completeOnboarding, createOnboardingStore, isFirstLaunch, trackLaunch } from "@/lib/preferences/onboarding";
import { createPrivacyPreferences, hasConsent, updateConsent } from "@/lib/preferences/privacy";
import { createThemePreferenceStore, toThemePreference } from "@/lib/preferences/theme";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("theme preference", () => {
  it("persists the selected theme and normalizes invalid values", async () => {
    const store = createThemePreferenceStore(createMemoryStorage());

    expect(await store.get("theme")).toBe("system");

    await store.patch({ theme: "dark" });
    expect(await store.get("theme")).toBe("dark");
    expect(toThemePreference("light")).toBe("light");
    expect(toThemePreference("bogus")).toBe("system");
  });
});

describe("privacy preferences", () => {
  it("defaults to no consent and updates individual consents", async () => {
    const store = createPrivacyPreferences(createMemoryStorage());

    expect(hasConsent(await store.read(), "analytics")).toBe(false);

    await updateConsent(store, { analytics: true }, 1000);

    const preferences = await store.read();
    expect(hasConsent(preferences, "analytics")).toBe(true);
    expect(hasConsent(preferences, "crashReporting")).toBe(false);
    expect(preferences.updatedAt).toBe(1000);
  });
});

describe("accessibility preferences", () => {
  it("stores preferences and merges OS settings for reduced motion", async () => {
    const preferences = createAccessibilityPreferences(createMemoryStorage());
    const adapter = createMemoryAccessibilityAdapter();

    await preferences.patch({ reduceMotion: true });
    adapter.emit({ reduceMotion: false, screenReaderEnabled: true, fontScale: 1.5 });

    expect(prefersReducedMotion(await preferences.read(), await adapter.get())).toBe(true);
    expect(prefersReducedMotion(DEFAULT_ACCESSIBILITY_PREFERENCES, await adapter.get())).toBe(false);
  });
});

describe("onboarding and first launch", () => {
  it("detects the first launch once and keeps the original timestamp", async () => {
    const store = createOnboardingStore(createMemoryStorage());

    const first = await trackLaunch(store, 1000);
    expect(first.firstLaunch).toBe(true);
    expect(isFirstLaunch(first.state)).toBe(true);
    expect(first.state.firstLaunchAt).toBe(1000);

    const second = await trackLaunch(store, 2000);
    expect(second.firstLaunch).toBe(false);
    expect(isFirstLaunch(second.state)).toBe(false);
    expect(second.state.firstLaunchAt).toBe(1000);
  });

  it("completes onboarding and records steps once", async () => {
    const store = createOnboardingStore(createMemoryStorage());

    const done = await completeOnboarding(store, "intro");
    expect(done.completed).toBe(true);
    expect(done.completedSteps).toEqual(["intro"]);

    const again = await completeOnboarding(store, "intro");
    expect(again.completedSteps).toEqual(["intro"]);
  });
});
