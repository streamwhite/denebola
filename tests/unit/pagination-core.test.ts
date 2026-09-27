import { describe, expect, it } from "vitest";
import { clampPage, computePagination, paginate } from "@/components/data/paginationCore";

describe("computePagination", () => {
  it("computes page count and navigation flags", () => {
    expect(computePagination(95, { page: 2, pageSize: 10 })).toEqual({ pageCount: 10, canPrev: true, canNext: true });
    expect(computePagination(10, { page: 1, pageSize: 10 })).toEqual({ pageCount: 1, canPrev: false, canNext: false });
    expect(computePagination(0, { page: 1, pageSize: 10 })).toEqual({ pageCount: 1, canPrev: false, canNext: false });
  });
});

describe("paginate", () => {
  it("slices the requested page", () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);

    expect(paginate(items, { page: 1, pageSize: 10 })).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(paginate(items, { page: 3, pageSize: 10 })).toEqual([21, 22, 23, 24, 25]);
  });
});

describe("clampPage", () => {
  it("keeps the page within range", () => {
    const meta = computePagination(95, { page: 1, pageSize: 10 });

    expect(clampPage(0, meta)).toBe(1);
    expect(clampPage(99, meta)).toBe(10);
    expect(clampPage(4, meta)).toBe(4);
  });
});
