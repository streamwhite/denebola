import { describe, expect, it, vi } from "vitest";
import { classifyLaunch, createLaunchTracker } from "@/lib/lifecycle/launch";
import { createMemorySplashAdapter } from "@/lib/lifecycle/splash";
import { createMemoryTerminationAdapter } from "@/lib/lifecycle/termination";

describe("classifyLaunch", () => {
  it("classifies cold, warm and resume starts", () => {
    expect(classifyLaunch(null)).toBe("cold");
    expect(classifyLaunch("background")).toBe("warm");
    expect(classifyLaunch("inactive")).toBe("resume");
  });

  it("tracks the first launch kind", () => {
    const tracker = createLaunchTracker();

    expect(tracker.observe("active")).toBe("cold");
    expect(tracker.observe("background")).toBe("cold");
    expect(createLaunchTracker("background").observe("active")).toBe("warm");
  });
});

describe("splash adapter", () => {
  it("records prevent and hide calls", async () => {
    const splash = createMemorySplashAdapter();

    await splash.preventAutoHide();
    await splash.hide();

    expect(splash.isPrevented()).toBe(true);
    expect(splash.isHidden()).toBe(true);
  });
});

describe("termination adapter", () => {
  it("notifies subscribers and unsubscribes", () => {
    const termination = createMemoryTerminationAdapter();
    const listener = vi.fn();

    const unsubscribe = termination.subscribe(listener);
    expect(termination.count()).toBe(1);

    termination.emit();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    expect(termination.count()).toBe(0);
  });
});
