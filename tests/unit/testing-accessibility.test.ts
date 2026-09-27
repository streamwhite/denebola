import { describe, expect, it } from "vitest";
import { describeMissingAccessibleName, meetsMinTouchTarget, MIN_TOUCH_TARGET, toAccessibilityProps } from "@/lib/testing/accessibility";

describe("accessibility testing helpers", () => {
  it("builds accessibility props", () => {
    expect(toAccessibilityProps({ label: "Save", role: "button", disabled: true })).toEqual({
      accessibilityLabel: "Save",
      accessibilityRole: "button",
      accessibilityState: { disabled: true },
    });
  });

  it("checks touch target size", () => {
    expect(meetsMinTouchTarget({ width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET })).toBe(true);
    expect(meetsMinTouchTarget({ width: 20, height: 44 })).toBe(false);
  });

  it("flags missing accessible names", () => {
    expect(describeMissingAccessibleName({ accessibilityLabel: "ok" })).toBeNull();
    expect(describeMissingAccessibleName({})).toBe("Missing accessibilityLabel");
  });
});
