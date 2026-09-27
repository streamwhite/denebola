import { describe, expect, it } from "vitest";
import { REDACTED, redact } from "@/lib/logging/redact";

describe("redact", () => {
  it("replaces sensitive keys regardless of case or position", () => {
    const result = redact({ Authorization: "Bearer x", user: { accessToken: "t", name: "Ada" } }) as Record<string, never>;

    expect(result).toEqual({ Authorization: REDACTED, user: { accessToken: REDACTED, name: "Ada" } });
  });

  it("keeps non-sensitive values and handles arrays and cycles", () => {
    const cycle: Record<string, unknown> = { count: 1, items: ["a", 2] };
    cycle.self = cycle;

    expect(redact(cycle)).toEqual({ count: 1, items: ["a", 2], self: "[circular]" });
  });
});
