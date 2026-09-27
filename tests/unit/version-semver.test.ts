import { describe, expect, it } from "vitest";
import { classifyChange, compareSemver, isBreaking, isNewer, parseSemver } from "@/lib/version/semver";

describe("parseSemver", () => {
  it("parses plain and ranged versions", () => {
    expect(parseSemver("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(parseSemver("~57.0.23")).toEqual({ major: 57, minor: 0, patch: 23 });
    expect(parseSemver(">=10")).toEqual({ major: 10, minor: 0, patch: 0 });
    expect(parseSemver("unknown")).toBeNull();
  });

  it("compares major, minor and patch in order", () => {
    expect(compareSemver(parseSemver("2.0.0")!, parseSemver("1.9.9")!)).toBeGreaterThan(0);
    expect(compareSemver(parseSemver("1.1.0")!, parseSemver("1.0.9")!)).toBeGreaterThan(0);
    expect(compareSemver(parseSemver("1.0.1")!, parseSemver("1.0.1")!)).toBe(0);
  });
});

describe("version change classification", () => {
  it("detects newer versions only in the forward direction", () => {
    expect(isNewer("0.2.0", "0.1.0")).toBe(true);
    expect(isNewer("0.1.0", "0.2.0")).toBe(false);
  });

  it("treats a major bump as breaking", () => {
    expect(isBreaking("0.9.0", "1.0.0")).toBe(true);
    expect(isBreaking("1.0.0", "1.1.0")).toBe(false);
  });

  it("classifies breaking, feature and fix changes", () => {
    expect(classifyChange("0.1.0", "1.0.0")).toBe("breaking");
    expect(classifyChange("0.1.0", "0.2.0")).toBe("feature");
    expect(classifyChange("0.1.0", "0.1.1")).toBe("fix");
    expect(classifyChange("0.2.0", "0.1.0")).toBe("fix");
  });
});
