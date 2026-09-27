import { describe, expect, it } from "vitest";
import { normalizeAppConfig } from "@/lib/config/appConfigCore";
import { readDeviceInfo } from "@/lib/device/deviceInfo";
import { describePlatform } from "@/lib/device/platformInfo";
import { toAppVersion } from "@/lib/version/appVersionCore";

const input = {
  platform: describePlatform("ios", "17.4"),
  app: normalizeAppConfig({ name: "Demo", slug: "demo" }),
  version: toAppVersion({ version: "1.0.0" }),
  locale: null,
  screen: { width: 390, height: 844, scale: 3 },
};

describe("readDeviceInfo", () => {
  it("combines platform, app and screen information", () => {
    expect(readDeviceInfo(input)).toMatchObject({ locale: "en", app: { name: "Demo" }, screen: { width: 390 } });
  });

  it("keeps a known locale", () => {
    expect(readDeviceInfo({ ...input, locale: "zh-CN" }).locale).toBe("zh-CN");
  });
});
