import { describe, expect, it } from "vitest";
import { filterItems, pageOf, searchItems, sortByValue } from "@/components/data/listData";

const items = [
  { name: "Beta", price: 20 },
  { name: "alpha", price: 5 },
  { name: "Gamma", price: 10 },
];

describe("sortByValue", () => {
  it("sorts ascending and descending without mutating the input", () => {
    expect(sortByValue(items, (item) => item.price).map((item) => item.name)).toEqual(["alpha", "Gamma", "Beta"]);
    expect(sortByValue(items, (item) => item.name, "desc").map((item) => item.name)).toEqual(["alpha", "Gamma", "Beta"]);
    expect(items.map((item) => item.name)).toEqual(["Beta", "alpha", "Gamma"]);
  });
});

describe("filterItems / searchItems", () => {
  it("filters by predicate and by case-insensitive substring", () => {
    expect(filterItems(items, (item) => item.price > 10).map((item) => item.name)).toEqual(["Beta"]);
    expect(searchItems(items, "a", (item) => item.name).map((item) => item.name)).toEqual(["Beta", "alpha", "Gamma"]);
    expect(searchItems(items, "gAm", (item) => item.name).map((item) => item.name)).toEqual(["Gamma"]);
    expect(searchItems(items, "  ", (item) => item.name)).toHaveLength(3);
  });
});

describe("pageOf", () => {
  it("paginates and clamps the requested page", () => {
    const page = pageOf([1, 2, 3, 4, 5], 2, 2);

    expect(page).toEqual({ items: [3, 4], page: 2, pageCount: 3, hasMore: true });
    expect(pageOf([1, 2, 3, 4, 5], 99, 2).page).toBe(3);
    expect(pageOf([], 1, 2)).toEqual({ items: [], page: 1, pageCount: 1, hasMore: false });
  });
});
