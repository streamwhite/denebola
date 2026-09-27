import { describe, expect, it } from "vitest";
import { isThemePreference, resolveColorScheme } from "@/lib/theme/colorScheme";
import { createTokens, typography } from "@/lib/theme/tokens";

describe("resolveColorScheme", () => {
  it("resolves the system preference from the OS scheme", () => {
    expect(resolveColorScheme("system", "dark")).toBe("dark");
    expect(resolveColorScheme("system", "light")).toBe("light");
    expect(resolveColorScheme("system", null)).toBe("light");
  });

  it("honours an explicit preference regardless of the system", () => {
    expect(resolveColorScheme("dark", "light")).toBe("dark");
    expect(resolveColorScheme("light", "dark")).toBe("light");
  });
});

describe("isThemePreference", () => {
  it("accepts known preferences only", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
  });
});

describe("createTokens", () => {
  it("returns the palette for the scheme plus shared scales", () => {
    const light = createTokens("light");
    const dark = createTokens("dark");

    expect(light.colors.background).not.toBe(dark.colors.background);
    expect(light.spacing.md).toBe(12);
    expect(light.radius.lg).toBe(12);
    expect(Object.keys(light.colors)).toEqual(Object.keys(dark.colors));
  });

  it("exposes typography variants with font size, line height and weight", () => {
    for (const token of Object.values(typography)) {
      expect(token.fontSize).toBeGreaterThan(0);
      expect(token.lineHeight).toBeGreaterThanOrEqual(token.fontSize);
      expect(String(token.fontWeight)).toMatch(/^\d+$/);
    }
  });
});
