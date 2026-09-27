import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const withMobileTemplate = require("../../packages/mobile-template/app.plugin.js");

describe("withMobileTemplate config plugin", () => {
  it("applies the default user interface style without overriding a consumer value", () => {
    expect(withMobileTemplate({}).userInterfaceStyle).toBe("automatic");
    expect(withMobileTemplate({ userInterfaceStyle: "dark" }).userInterfaceStyle).toBe("dark");
  });

  it("adds iOS associated domains for Universal Links", () => {
    const config = withMobileTemplate({ ios: { bundleIdentifier: "com.example.app", associatedDomains: ["applinks:existing.com"] } }, { universalLinks: ["example.com"] });

    expect(config.ios.bundleIdentifier).toBe("com.example.app");
    expect(config.ios.associatedDomains).toEqual(["applinks:existing.com", "applinks:example.com"]);
  });

  it("adds verified Android intent filters for App Links", () => {
    const config = withMobileTemplate({}, { appLinks: ["example.com"] });

    expect(config.android.intentFilters).toEqual([
      { action: "VIEW", autoVerify: true, data: [{ scheme: "https", host: "example.com" }], category: ["BROWSABLE", "DEFAULT"] },
    ]);
  });

  it("adds native permission usage descriptions and Android permissions", () => {
    const config = withMobileTemplate({}, { permissions: { camera: "Camera access", photos: "Photo access", notifications: "Alerts" } });

    expect(config.ios.infoPlist.NSCameraUsageDescription).toBe("Camera access");
    expect(config.ios.infoPlist.NSPhotoLibraryUsageDescription).toBe("Photo access");
    expect(config.android.permissions).toEqual([
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.POST_NOTIFICATIONS",
    ]);
  });

  it("applies native build identifiers", () => {
    const config = withMobileTemplate({}, { build: { bundleIdentifier: "com.example.app", packageName: "com.example.app", buildNumber: "5", versionCode: 7 } });

    expect(config.ios.bundleIdentifier).toBe("com.example.app");
    expect(config.ios.buildNumber).toBe("5");
    expect(config.android.package).toBe("com.example.app");
    expect(config.android.versionCode).toBe(7);
  });

  it("leaves the native config untouched when no domains are given", () => {
    const config = withMobileTemplate({});

    expect(config.ios).toBeUndefined();
    expect(config.android).toBeUndefined();
  });
});
