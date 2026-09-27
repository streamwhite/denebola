import { describe, expect, it } from "vitest";
import { auditSecurityConfig, hasSecurityErrors, normalizeSecurityConfig } from "@/lib/security/config";
import { validateDeepLink } from "@/lib/security/deepLinkValidation";
import { auditDependencies } from "@/lib/security/dependencyAudit";
import { createMemoryNetworkSecurityAdapter, evaluateNetworkSecurity, isHostPinned } from "@/lib/security/networkSecurity";
import { excessPermissions, minimalPermissionSet } from "@/lib/security/permissionMinimization";
import { createSensitiveKeyMatcher, filterSensitive, redactSensitive } from "@/lib/security/secrets";

describe("security config", () => {
  it("normalizes defaults and flags unsafe production settings", () => {
    const config = normalizeSecurityConfig({ allowCleartext: true });
    expect(config.minTlsVersion).toBe("1.2");
    expect(config.certificatePinning.hosts).toEqual([]);

    const issues = auditSecurityConfig(config, true);
    expect(hasSecurityErrors(issues)).toBe(true);
    expect(issues.map((issue) => issue.code)).toContain("cleartext");
  });

  it("passes a safe production config", () => {
    expect(auditSecurityConfig(normalizeSecurityConfig({ certificatePinning: { hosts: ["api.example.com"] } }), true)).toEqual([]);
  });
});

describe("network security", () => {
  it("allows https and blocks cleartext by default", () => {
    const policy = { allowCleartext: false, pinnedHosts: [] };
    expect(evaluateNetworkSecurity("https://api.example.com", policy)).toEqual({ allowed: true });
    expect(evaluateNetworkSecurity("http://api.example.com", policy)).toEqual({ allowed: false, reason: "cleartext" });
    expect(evaluateNetworkSecurity("ftp://api.example.com", policy)).toEqual({ allowed: false, reason: "not-https" });
    expect(evaluateNetworkSecurity("nope", policy)).toEqual({ allowed: false, reason: "not-https" });
    expect(evaluateNetworkSecurity("http://api.example.com", { ...policy, allowCleartext: true })).toEqual({ allowed: true });
  });

  it("matches pinned hosts including subdomains", () => {
    expect(isHostPinned("api.example.com", ["example.com"])).toBe(true);
    expect(isHostPinned("example.com", ["example.com"])).toBe(true);
    expect(isHostPinned("evil.com", ["example.com"])).toBe(false);
  });

  it("applies policy through the memory adapter", async () => {
    const adapter = createMemoryNetworkSecurityAdapter();
    const policy = { allowCleartext: false, pinnedHosts: ["example.com"] };
    await adapter.apply(policy);
    expect(adapter.current()).toEqual(policy);
  });
});

describe("permission minimization", () => {
  it("keeps used permissions and reports excess ones", () => {
    expect(minimalPermissionSet({ camera: true, photos: false })).toEqual(["camera"]);
    expect(excessPermissions(["camera", "photos"], { camera: true })).toEqual(["photos"]);
  });
});

describe("deep link validation", () => {
  const config = { scheme: "myapp", allowedPaths: [/^\/profile/] };

  it("accepts allowed paths and classifies the rest", () => {
    expect(validateDeepLink("myapp://profile/1", config)).toEqual({ ok: true, value: { pathname: "/profile/1" } });
    expect(validateDeepLink("myapp://other/1", config)).toEqual({ ok: false, error: "disallowed-path" });
    expect(validateDeepLink("https://evil.com", config)).toEqual({ ok: false, error: "untrusted-scheme" });
    expect(validateDeepLink("nope", config)).toEqual({ ok: false, error: "invalid-url" });
  });
});

describe("dependency audit", () => {
  it("flags blocked and non-allowed dependencies", () => {
    const blocked = auditDependencies({ lodash: "1.0.0", "@bad/pkg": "1.0.0" }, { blocked: ["lodash", "@bad"] });
    expect(blocked.ok).toBe(false);
    expect(blocked.violations).toEqual([
      { name: "lodash", reason: "blocked" },
      { name: "@bad/pkg", reason: "blocked" },
    ]);

    const scoped = auditDependencies({ react: "19.0.0", lodash: "1.0.0" }, { blocked: [], allowed: ["react"] });
    expect(scoped.violations).toEqual([{ name: "lodash", reason: "not-allowed" }]);
  });
});

describe("sensitive log filtering", () => {
  it("drops and redacts sensitive keys", () => {
    expect(filterSensitive({ password: "x", user: "a" })).toEqual({ user: "a" });
    expect(redactSensitive({ accessToken: "x", user: "a" })).toEqual({ accessToken: "[redacted]", user: "a" });
    expect(createSensitiveKeyMatcher(["ssn"])("user_ssn")).toBe(true);
  });
});
