import { describe, expect, it } from "vitest";
import { resolveLogLevel } from "@/lib/logging/level";

describe("resolveLogLevel", () => {
  it("accepts known levels case-insensitively", () => {
    expect(resolveLogLevel("WARN", "info")).toBe("warn");
    expect(resolveLogLevel(" trace ", "info")).toBe("trace");
  });

  it("falls back for unknown or missing values", () => {
    expect(resolveLogLevel("verbose", "info")).toBe("info");
    expect(resolveLogLevel(undefined, "debug")).toBe("debug");
  });
});