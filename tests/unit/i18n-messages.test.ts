import { describe, expect, it } from "vitest";
import { mergeMessages, messages } from "@/lib/i18n/messages";

describe("mergeMessages", () => {
  it("keeps framework defaults and adds app messages for the locale", () => {
    const merged = mergeMessages("en", { en: { "home.title": "Home" } });

    expect(merged["home.title"]).toBe("Home");
    expect(merged["common.retry"]).toBe(messages.en["common.retry"]);
  });

  it("falls back to framework messages when the app has none for the locale", () => {
    const merged = mergeMessages("zh-CN");

    expect(merged["common.retry"]).toBe(messages["zh-CN"]["common.retry"]);
  });

  it("lets app messages override a framework default", () => {
    const merged = mergeMessages("en", { en: { "common.retry": "Reload" } });

    expect(merged["common.retry"]).toBe("Reload");
  });
});
