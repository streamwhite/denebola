import { describe, expect, it, vi } from "vitest";
import { batteryLevelPercent, createMemoryBattery, isLowBattery, noopBattery } from "@/lib/device/battery";
import { clampBrightness, createMemoryBrightness, DEFAULT_BRIGHTNESS } from "@/lib/device/brightness";
import { createMemoryClipboard } from "@/lib/device/clipboard";
import { createMemoryHaptics, noopHaptics } from "@/lib/device/haptics";
import { isLandscape, toScreenOrientation } from "@/lib/device/orientation";

describe("battery", () => {
  it("formats level and flags low battery", () => {
    expect(batteryLevelPercent(0.42)).toBe(42);
    expect(batteryLevelPercent(null)).toBeNull();
    expect(isLowBattery({ level: 0.1, state: "unplugged", lowPowerMode: false })).toBe(true);
    expect(isLowBattery({ level: 0.9, state: "unplugged", lowPowerMode: false })).toBe(false);
  });

  it("notifies subscribers through the memory adapter", async () => {
    const battery = createMemoryBattery();
    const listener = vi.fn();
    battery.subscribe(listener);

    const next = { level: 0.5, state: "charging" as const, lowPowerMode: false };
    battery.emit(next);

    expect(listener).toHaveBeenCalledWith(next);
    expect(await battery.get()).toEqual(next);
  });

  it("exposes a noop adapter", async () => {
    expect(await noopBattery.get()).toEqual({ level: null, state: "unknown", lowPowerMode: false });
  });
});

describe("clipboard", () => {
  it("reads and writes strings", async () => {
    const clipboard = createMemoryClipboard();

    expect(await clipboard.getString()).toBeNull();

    await clipboard.setString("hello");
    expect(await clipboard.getString()).toBe("hello");
  });
});

describe("haptics", () => {
  it("records triggered feedback and tolerates the noop adapter", async () => {
    const haptics = createMemoryHaptics();

    await haptics.trigger("success");
    await noopHaptics.trigger("error");

    expect(haptics.events).toEqual(["success"]);
  });
});

describe("brightness", () => {
  it("clamps out-of-range values and persists them", async () => {
    expect(clampBrightness(1.5)).toBe(1);
    expect(clampBrightness(-1)).toBe(0);
    expect(clampBrightness(Number.NaN)).toBe(DEFAULT_BRIGHTNESS);

    const brightness = createMemoryBrightness();
    await brightness.set(2);
    expect(await brightness.get()).toBe(1);
  });
});

describe("orientation", () => {
  it("normalizes and classifies orientations", () => {
    expect(toScreenOrientation("landscape-left")).toBe("landscape-left");
    expect(toScreenOrientation("nonsense")).toBe("unknown");
    expect(isLandscape("landscape")).toBe(true);
    expect(isLandscape("portrait")).toBe(false);
  });
});
