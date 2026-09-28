import { describe, expect, it } from "vitest";
import { allowedExternalSchemes, isAllowedExternalUrl } from "@/lib/deeplink/allowlist";

describe("isAllowedExternalUrl", () => {
  it("accepts only the allowlisted schemes", () => {
    expect(allowedExternalSchemes).toEqual(["https", "mailto", "myapp"]);
    expect(isAllowedExternalUrl("https://example.com/path?q=1")).toBe(true);
    expect(isAllowedExternalUrl("mailto:dev@example.com")).toBe(true);
    expect(isAllowedExternalUrl("myapp://orders/1")).toBe(true);
  });

  it("rejects other schemes and malformed input", () => {
    expect(isAllowedExternalUrl("http://example.com")).toBe(false);
    expect(isAllowedExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl("tel:+123456")).toBe(false);
    expect(isAllowedExternalUrl("not a url")).toBe(false);
    expect(isAllowedExternalUrl("")).toBe(false);
  });
});
