import { describe, expect, it } from "vitest";
import { appLinkPath, isAppLink } from "@/lib/integration/appLinks";
import { isAllowedUrl, urlScheme, type UrlPolicy } from "@/lib/integration/urls";

const policy: UrlPolicy = { schemes: ["https", "myapp"], hosts: ["example.com"] };

describe("isAllowedUrl", () => {
  it("enforces scheme, host and optional path rules", () => {
    expect(isAllowedUrl("https://example.com/a", policy)).toBe(true);
    expect(isAllowedUrl("https://sub.example.com/a", policy)).toBe(true);
    expect(isAllowedUrl("http://example.com", policy)).toBe(false);
    expect(isAllowedUrl("https://evil.com/a", policy)).toBe(false);
    expect(isAllowedUrl("not a url", policy)).toBe(false);
  });

  it("applies path patterns when provided", () => {
    const scoped: UrlPolicy = { schemes: ["https"], paths: [/^\/app\//] };
    expect(isAllowedUrl("https://any.com/app/x", scoped)).toBe(true);
    expect(isAllowedUrl("https://any.com/other", scoped)).toBe(false);
  });
});

describe("urlScheme", () => {
  it("extracts the custom url scheme", () => {
    expect(urlScheme("myapp://profile/1")).toBe("myapp");
    expect(urlScheme("nope")).toBeNull();
  });
});

describe("app links", () => {
  it("recognizes verified https hosts and yields a route path", () => {
    expect(isAppLink("https://example.com/profile/1", ["example.com"])).toBe(true);
    expect(isAppLink("https://evil.com/profile/1", ["example.com"])).toBe(false);
    expect(appLinkPath("https://example.com/profile/1")).toBe("/example.com/profile/1");
    expect(appLinkPath("myapp://profile/1")).toBeNull();
  });
});
