import "@/lib/i18n/polyfills";
import { describe, expect, it } from "vitest";

describe("locale data", () => {
  it("formats Chinese currency without falling back to English", () => {
    const value = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(1234.5);

    expect(value).toContain("¥");
  });

  it("formats Chinese dates without falling back to English", () => {
    const value = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(0));

    expect(value).toContain("1970");
    expect(value).not.toContain("January");
  });

  it("applies timezone offsets instead of falling back to UTC", () => {
    const value = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeZone: "Asia/Shanghai" }).format(new Date(Date.UTC(1970, 0, 1, 20, 0, 0)));

    expect(value).toBe("1970年1月2日");
  });

  it("formats Chinese relative time", () => {
    const value = new Intl.RelativeTimeFormat("zh-CN").format(-1, "day");

    expect(value).toContain("1");
  });

  it("selects Chinese plural categories", () => {
    const rule = new Intl.PluralRules("zh-CN");

    expect(rule.select(1)).toBe("other");
  });
});
