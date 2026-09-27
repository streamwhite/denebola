import { describe, expect, it } from "vitest";
import { toLifecycleState } from "@/lib/lifecycle/lifecycleState";

describe("toLifecycleState", () => {
  it("maps active and background directly", () => {
    expect(toLifecycleState("active")).toBe("active");
    expect(toLifecycleState("background")).toBe("background");
  });

  it("maps everything else to inactive", () => {
    expect(toLifecycleState("inactive")).toBe("inactive");
    expect(toLifecycleState("unknown")).toBe("inactive");
    expect(toLifecycleState("extension")).toBe("inactive");
  });
});
