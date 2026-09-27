import { describe, expect, it, vi } from "vitest";
import { createConsentedAnalytics } from "@/lib/analytics/consent";
import { createMemoryCrashReporter } from "@/lib/analytics/crash";
import { createMemoryNetworkTracker, createPerformanceNetworkTracker } from "@/lib/analytics/network";
import { createSessionTracker } from "@/lib/analytics/session";
import { DEFAULT_PRIVACY_PREFERENCES, type PrivacyPreferences } from "@/lib/preferences/privacy";
import type { PerformanceSpan } from "@/lib/performance/performance";

describe("createConsentedAnalytics", () => {
  it("blocks tracking until consent is granted", () => {
    const analytics = { track: vi.fn(), identify: vi.fn(), screen: vi.fn() };
    let preferences: PrivacyPreferences = DEFAULT_PRIVACY_PREFERENCES;
    const gated = createConsentedAnalytics(analytics, () => preferences);

    gated.track("opened");
    gated.screen("home");
    expect(analytics.track).not.toHaveBeenCalled();
    expect(analytics.screen).not.toHaveBeenCalled();

    preferences = { ...preferences, consent: { ...preferences.consent, analytics: true } };
    gated.track("opened", { source: "push" });
    gated.identify("user-1");

    expect(analytics.track).toHaveBeenCalledWith("opened", { source: "push" });
    expect(analytics.identify).toHaveBeenCalledWith("user-1", undefined);
  });
});

describe("createSessionTracker", () => {
  it("tracks the active session lifecycle", () => {
    let counter = 0;
    const tracker = createSessionTracker({ id: () => `s${++counter}`, now: () => 100 });

    expect(tracker.isActive()).toBe(false);
    expect(tracker.start()).toEqual({ id: "s1", startedAt: 100 });
    expect(tracker.isActive()).toBe(true);

    tracker.end();
    expect(tracker.current()).toBeNull();
  });
});

describe("crash reporter", () => {
  it("captures errors through the memory reporter", () => {
    const crashes = createMemoryCrashReporter();
    crashes.capture(new Error("boom"));

    expect(crashes.captured()).toHaveLength(1);
  });
});

describe("network tracker", () => {
  it("records requests", () => {
    const tracker = createMemoryNetworkTracker();
    tracker.record({ method: "GET", url: "/a", status: 200, ok: true, durationMs: 12 });

    expect(tracker.requests()).toEqual([{ method: "GET", url: "/a", status: 200, ok: true, durationMs: 12 }]);
  });

  it("forwards timings to the performance monitor", () => {
    const spans: PerformanceSpan[] = [];
    createPerformanceNetworkTracker({ record: (span) => spans.push(span) }).record({ method: "POST", url: "/b", durationMs: 5 });

    expect(spans).toHaveLength(1);
    expect(spans[0].name).toBe("network POST");
    expect(spans[0].durationMs).toBe(5);
  });
});
