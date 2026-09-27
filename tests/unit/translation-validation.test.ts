import { describe, expect, it } from "vitest";
import { extractPlaceholders, validateTranslations } from "@/lib/i18n/validation";

describe("extractPlaceholders", () => {
  it("collects and sorts placeholder names", () => {
    expect(extractPlaceholders("Hi {name}, you have {count} items")).toEqual(["count", "name"]);
    expect(extractPlaceholders("No placeholders")).toEqual([]);
  });
});

describe("validateTranslations", () => {
  const base = { "home.title": "Home", "cart.items": "{count, plural, one {# item} other {# items}}" };

  it("reports nothing when every locale matches the base", () => {
    expect(validateTranslations({ en: base, "zh-CN": { "home.title": "首页", "cart.items": "{count, plural, other {# 项}}" } }, "en")).toEqual([]);
  });

  it("reports missing keys", () => {
    expect(validateTranslations({ en: base, fr: { "home.title": "Accueil" } }, "en")).toContainEqual({ type: "missing", locale: "fr", key: "cart.items" });
  });

  it("reports extra keys", () => {
    expect(validateTranslations({ en: base, fr: { ...base, ghost: "x" } }, "en")).toContainEqual({ type: "extra", locale: "fr", key: "ghost" });
  });

  it("reports placeholder mismatches", () => {
    const issues = validateTranslations({ en: { greeting: "Hi {name}" }, fr: { greeting: "Salut" } }, "en");
    expect(issues).toContainEqual({ type: "placeholder-mismatch", locale: "fr", key: "greeting", placeholders: ["name"] });
  });

  it("returns nothing when the base locale is unknown", () => {
    expect(validateTranslations({ fr: { a: "A" } }, "en")).toEqual([]);
  });
});
