import "@/lib/i18n/polyfills";
import { createIntl, createIntlCache } from "react-intl";
import { describe, expect, it } from "vitest";
import { DATE_STYLE_LONG, TRANS_CURRENCY, TRANS_UNIT } from "@/lib/i18n/categories";

function intlFor(locale: string) {
  return createIntl({ locale, messages: {} }, createIntlCache());
}

describe("i18n formatting categories", () => {
  it("formats currency per locale", () => {
    expect(intlFor("en").formatNumber(1234.5, { style: "currency", currency: TRANS_CURRENCY })).toContain("$");
    expect(intlFor("zh-CN").formatNumber(1234.5, { style: "currency", currency: "CNY" })).toContain("¥");
  });

  it("formats long dates per locale", () => {
    const date = new Date(Date.UTC(2024, 0, 2, 12, 0, 0));
    const english = intlFor("en").formatDate(date, { dateStyle: DATE_STYLE_LONG, timeZone: "UTC" });
    const chinese = intlFor("zh-CN").formatDate(date, { dateStyle: DATE_STYLE_LONG, timeZone: "UTC" });

    expect(english).toContain("2024");
    expect(chinese).toContain("2024");
    expect(english).not.toBe(chinese);
  });

  it("resolves ICU pluralization for relative time", () => {
    const intl = intlFor("en");

    expect(intl.formatRelativeTime(-1, TRANS_UNIT, { numeric: "auto" })).toMatch(/yesterday|1 day/);
    expect(intl.formatRelativeTime(-3, "day")).toContain("3");
  });

  it("applies ICU select and plural in messages", () => {
    const messages = { items: "{count, plural, one {# item} other {# items}}" };
    const intl = createIntl({ locale: "en", messages }, createIntlCache());

    expect(intl.formatMessage({ id: "items" }, { count: 1 })).toBe("1 item");
    expect(intl.formatMessage({ id: "items" }, { count: 5 })).toBe("5 items");
  });
});
