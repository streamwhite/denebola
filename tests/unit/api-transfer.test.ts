import { describe, expect, it } from "vitest";
import { toFormData, uploadRatio } from "@/lib/api/transfer";

describe("uploadRatio", () => {
  it("computes a clamped ratio", () => {
    expect(uploadRatio(5, 10)).toEqual({ loaded: 5, total: 10, ratio: 0.5 });
    expect(uploadRatio(12, 10).ratio).toBe(1);
    expect(uploadRatio(0, 0).ratio).toBe(0);
  });
});

describe("toFormData", () => {
  it("appends scalar fields and file objects", () => {
    const form = toFormData({ title: "avatar" }, { file: { uri: "file://a.png", name: "a.png", type: "image/png" } });

    expect(form.get("title")).toBe("avatar");
    expect(form.get("file")).toBeTruthy();
  });

  it("appends every file from an array field", () => {
    const form = toFormData({}, { files: [{ uri: "a", name: "a", type: "image/png" }, { uri: "b", name: "b", type: "image/png" }] });

    expect(form.getAll("files")).toHaveLength(2);
  });
});
