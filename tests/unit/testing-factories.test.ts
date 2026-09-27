import { describe, expect, it } from "vitest";
import { createFactory, createSequence } from "@/lib/testing/factories";
import { defineFixture } from "@/lib/testing/fixtures";
import { SNAPSHOT_PLACEHOLDER, stableSnapshot } from "@/lib/testing/snapshot";

describe("fixtures and factories", () => {
  it("builds fixtures with overrides", () => {
    const user = defineFixture({ id: "1", name: "a" });

    expect(user()).toEqual({ id: "1", name: "a" });
    expect(user({ name: "b" })).toEqual({ id: "1", name: "b" });
  });

  it("creates sequences and sequenced factories", () => {
    const next = createSequence(10);
    expect(next()).toBe(10);
    expect(next()).toBe(11);

    const note = createFactory((index) => ({ id: `n${index}` }));
    expect(note()).toEqual({ id: "n1" });
    expect(note({ id: "x" })).toEqual({ id: "x" });
  });
});

describe("stableSnapshot", () => {
  it("replaces volatile fields and recurses", () => {
    const snapshot = stableSnapshot({ id: "abc", createdAt: 123, nested: { updatedAt: 1, name: "ok" }, list: [{ id: "z" }] });

    expect(snapshot).toEqual({
      id: SNAPSHOT_PLACEHOLDER,
      createdAt: SNAPSHOT_PLACEHOLDER,
      nested: { updatedAt: SNAPSHOT_PLACEHOLDER, name: "ok" },
      list: [{ id: SNAPSHOT_PLACEHOLDER }],
    });
  });
});
