import { describe, expect, it } from "vitest";
import { describePlatform } from "@/lib/device/platformInfo";

describe("describePlatform", () => {
  it("flags the running platform", () => {
    expect(describePlatform("ios", "17.4")).toMatchObject({ os: "ios", isIOS: true, isAndroid: false, isWeb: false, isNative: true });
    expect(describePlatform("Android", 34)).toMatchObject({ os: "android", isAndroid: true, isNative: true, version: "34" });
  });

  it("treats web as non-native", () => {
    expect(describePlatform("web", "5.0")).toMatchObject({ isWeb: true, isNative: false });
  });
});
