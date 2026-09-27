import { describe, expect, it } from "vitest";
import { toQueryString } from "@/lib/api/queryString";

describe("toQueryString", () => {
  it("serializes defined values and skips null or undefined ones", () => {
    expect(toQueryString({ page: 1, pageSize: 20, q: "ada", active: true, cursor: null, tag: undefined })).toBe("?page=1&pageSize=20&q=ada&active=true");
  });

  it("returns an empty string when there is nothing to serialize", () => {
    expect(toQueryString({ cursor: null })).toBe("");
  });
});
