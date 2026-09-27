import { describe, expect, it } from "vitest";
import { createFeatureFlags, defaultFeatureFlags } from "@/lib/features/flags";

describe("createFeatureFlags", () => {
  it("merges overrides over the defaults", () => {
    expect(createFeatureFlags({ offlineMode: true })).toMatchObject({ newHome: true, offlineMode: true, notifications: false });
  });

  it("adds new flags and does not mutate the defaults", () => {
    const flags = createFeatureFlags({ betaSearch: true });

    expect(flags.betaSearch).toBe(true);
    expect(defaultFeatureFlags).not.toHaveProperty("betaSearch");
  });
});
