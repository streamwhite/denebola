import { describe, expect, it } from "vitest";
import { toAppVersion } from "@/lib/version/appVersionCore";

describe("toAppVersion", () => {
  it("reads marketing, native build and runtime versions", () => {
    expect(toAppVersion({ version: "1.2.3", runtimeVersion: "sdk57", ios: { buildNumber: "42" } })).toEqual({
      marketing: "1.2.3",
      build: "42",
      runtime: "sdk57",
    });
  });

  it("falls back to the android versionCode and marketing version", () => {
    expect(toAppVersion({ version: "1.2.3", android: { versionCode: 7 } })).toEqual({
      marketing: "1.2.3",
      build: "7",
      runtime: "1.2.3",
    });
  });

  it("is safe when no config is available", () => {
    expect(toAppVersion(undefined)).toEqual({ marketing: "0.0.0", build: "0", runtime: "0.0.0" });
  });
});
