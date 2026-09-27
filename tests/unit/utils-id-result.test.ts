import { describe, expect, it } from "vitest";
import { createId, createPrefixedId, createUuid, isUuid } from "@/lib/utils/id";
import { err, isErr, isOk, mapResult, ok, toResult, toResultAsync, unwrapOr } from "@/lib/utils/result";

describe("id utilities", () => {
  it("creates ids of the requested length", () => {
    expect(createId()).toHaveLength(16);
    expect(createId(8)).toHaveLength(8);
    expect(createId(8)).not.toBe(createId(8));
  });

  it("prefixes ids", () => {
    expect(createPrefixedId("user", 4)).toMatch(/^user_[0-9a-z]{4}$/);
  });

  it("creates and validates uuids", () => {
    const uuid = createUuid();
    expect(isUuid(uuid)).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});

describe("result utilities", () => {
  it("represents success and failure", () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isErr(err("x"))).toBe(true);
    expect(unwrapOr(ok(1), 0)).toBe(1);
    expect(unwrapOr(err("x"), 0)).toBe(0);
  });

  it("maps success and passes through failure", () => {
    expect(mapResult(ok(2), (value) => value * 2)).toEqual({ ok: true, value: 4 });
    expect(mapResult(err("x"), (value: number) => value * 2)).toEqual({ ok: false, error: "x" });
  });

  it("captures thrown errors", async () => {
    const sync = toResult(() => {
      throw new Error("boom");
    });
    expect(isErr(sync)).toBe(true);

    const asyncResult = await toResultAsync(async () => "value");
    expect(asyncResult).toEqual({ ok: true, value: "value" });
  });
});
