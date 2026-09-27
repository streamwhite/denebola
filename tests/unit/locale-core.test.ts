import { describe, expect, it } from "vitest";
import { canonicalLocale, detectLocale, fallbackMessages, localeTag, supportedLocales } from "@/lib/i18n/localeCore";

const catalogs = { en: { a: "A" }, "zh-CN": { a: "甲" }, fr: { a: "A-fr" } };

describe("localeTag", () => {
  it("normalizes underscores and rejects invalid tags", () => {
    expect(localeTag("zh_CN")).toBe("zh-CN");
    expect(localeTag(" en ")).toBe("en");
    expect(localeTag("!!")).toBe("");
    expect(localeTag(undefined)).toBe("");
  });
});

describe("supportedLocales", () => {
  it("reads keys from a catalog and a list as-is", () => {
    expect(supportedLocales(catalogs)).toEqual(["en", "zh-CN", "fr"]);
    expect(supportedLocales(["en", "fr"])).toEqual(["en", "fr"]);
  });
});

describe("canonicalLocale", () => {
  it("matches exactly, then by base language, then fails", () => {
    expect(canonicalLocale("zh-CN", ["en", "zh-CN"])).toBe("zh-CN");
    expect(canonicalLocale("zh-Hans", ["en", "zh-CN"])).toBe("zh-CN");
    expect(canonicalLocale("de", ["en", "zh-CN"])).toBeNull();
  });
});

describe("detectLocale", () => {
  it("returns the first matching candidate or the fallback", () => {
    expect(detectLocale(["de", "zh-TW"], ["en", "zh-CN"], "en")).toBe("zh-CN");
    expect(detectLocale([null, "fr-CA"], ["en", "fr"], "en")).toBe("fr");
    expect(detectLocale(["de"], ["en", "fr"], "en")).toBe("en");
  });
});

describe("fallbackMessages", () => {
  it("returns the locale catalog, then the fallback, then empty", () => {
    expect(fallbackMessages("zh-CN", catalogs, "en")).toEqual({ a: "甲" });
    expect(fallbackMessages("de", catalogs, "en")).toEqual({ a: "A" });
    expect(fallbackMessages("de", ["en", "fr"], "en")).toEqual({});
  });
});
