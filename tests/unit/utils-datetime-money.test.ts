import { describe, expect, it } from "vitest";
import { addMs, deviceTimeZone, diffMs, formatInTimeZone, isValidDate, startOfDay, toIsoDate } from "@/lib/utils/datetime";
import { addMoney, clampNumber, formatMoney, formatNumber, roundTo, toMajorUnits, toMinorUnits } from "@/lib/utils/money";

describe("date/time utilities", () => {
  it("validates and serializes dates", () => {
    expect(isValidDate(new Date(0))).toBe(true);
    expect(isValidDate(new Date("nope"))).toBe(false);
    expect(toIsoDate(0)).toBe("1970-01-01T00:00:00.000Z");
    expect(toIsoDate("nope")).toBeNull();
  });

  it("adds and diffs timestamps", () => {
    expect(addMs(1000, 500).getTime()).toBe(1500);
    expect(diffMs(1000, 2500)).toBe(1500);
  });

  it("resets to the start of the local day", () => {
    const local = new Date(2024, 5, 15, 13, 45, 30);
    const start = startOfDay(local);

    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(15);
  });

  it("exposes the device time zone and formats in a specific zone", () => {
    expect(deviceTimeZone().length).toBeGreaterThan(0);
    expect(formatInTimeZone(0, "UTC", "en-US")).toContain("1970");
  });
});

describe("money and number utilities", () => {
  it("converts between minor and major units", () => {
    expect(toMinorUnits(12.34)).toBe(1234);
    expect(toMajorUnits(1234)).toBe(12.34);
  });

  it("adds matching currencies and rejects mismatches", () => {
    expect(addMoney({ amount: 100, currency: "USD" }, { amount: 50, currency: "USD" })).toEqual({ amount: 150, currency: "USD" });
    expect(() => addMoney({ amount: 1, currency: "USD" }, { amount: 1, currency: "EUR" })).toThrow("Currency mismatch");
  });

  it("formats currency and numbers, clamps and rounds", () => {
    expect(formatMoney({ amount: 1234, currency: "USD" }, "en-US")).toBe("$12.34");
    expect(formatNumber(1234.5, "en-US")).toBe("1,234.5");
    expect(clampNumber(5, 0, 3)).toBe(3);
    expect(roundTo(1.2345, 2)).toBe(1.23);
  });
});
