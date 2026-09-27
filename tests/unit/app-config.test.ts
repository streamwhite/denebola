import { describe, expect, it } from "vitest";
import { normalizeAppConfig } from "@/lib/config/appConfigCore";

describe("normalizeAppConfig", () => {
  it("reads identity fields from the Expo config", () => {
    const config = normalizeAppConfig({
      name: "Demo",
      slug: "demo",
      scheme: ["demo", "demo-alt"],
      version: "2.1.0",
      sdkVersion: "57.0.0",
      ios: { bundleIdentifier: "com.example.demo" },
      android: { package: "com.example.demo" },
    });

    expect(config).toEqual({
      name: "Demo",
      slug: "demo",
      scheme: "demo",
      version: "2.1.0",
      sdkVersion: "57.0.0",
      bundleId: "com.example.demo",
      packageName: "com.example.demo",
    });
  });

  it("provides safe fallbacks when the config is missing", () => {
    expect(normalizeAppConfig(undefined)).toEqual({
      name: "",
      slug: "",
      scheme: "",
      version: "0.0.0",
      sdkVersion: "",
      bundleId: "",
      packageName: "",
    });
  });
});
