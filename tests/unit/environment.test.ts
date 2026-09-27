import { describe, expect, it } from "vitest";
import { resolveEnvironment } from "@/lib/config/environment";

describe("resolveEnvironment", () => {
  it("accepts known environments case-insensitively", () => {
    expect(resolveEnvironment("preview", false)).toBe("preview");
    expect(resolveEnvironment("  PRODUCTION ", true)).toBe("production");
  });

  it("falls back to development in debug and production otherwise", () => {
    expect(resolveEnvironment(undefined, true)).toBe("development");
    expect(resolveEnvironment("staging", false)).toBe("production");
  });
});
