import { describe, expect, it } from "vitest";
import { checkCompatibility, latestCompatibleLine, upgradeAvailable, VERSION_MATRIX } from "@/lib/version/compatibility";

describe("version compatibility matrix", () => {
  it("marks a project compatible when the native stack matches its framework line", () => {
    const result = checkCompatibility({ framework: "0.1.0", expo: "57.0.23", react: "19.2.4", reactNative: "0.86.3" });

    expect(result.supported).toBe(true);
    expect(result.nativeRebuild).toBe(false);
    expect(result.issues).toEqual([]);
    expect(result.entry?.expo).toBe(VERSION_MATRIX[0].expo);
  });

  it("flags native-stack drift and requires a rebuild", () => {
    const result = checkCompatibility({ framework: "0.1.0", expo: "58.0.0", react: "19.2.4", reactNative: "0.87.1" });

    expect(result.supported).toBe(false);
    expect(result.nativeRebuild).toBe(true);
    expect(result.issues.map((issue) => issue.dependency)).toContain("expo");
    expect(result.issues.map((issue) => issue.dependency)).toContain("react-native");
  });

  it("reports an unsupported framework line", () => {
    const result = checkCompatibility({ framework: "9.9.0" });

    expect(result.supported).toBe(false);
    expect(result.entry).toBeNull();
    expect(result.issues[0].dependency).toBe("framework");
  });

  it("reports the latest supported line and upgrade availability", () => {
    expect(latestCompatibleLine()).toBe(VERSION_MATRIX[VERSION_MATRIX.length - 1].framework);
    expect(upgradeAvailable("0.0.1")).toBe(true);
    expect(upgradeAvailable(latestCompatibleLine())).toBe(false);
  });
});
