import { describe, expect, it } from "vitest";
import { filterOptions, findExact, labelFor, labelsFor, toOption } from "@/components/forms/selectCore";

const options = [
  { value: "ada", label: "Ada Lovelace" },
  { value: "alan", label: "Alan Turing" },
  { value: "grace", label: "Grace Hopper", disabled: true },
];

describe("filterOptions", () => {
  it("matches label and value case-insensitively", () => {
    expect(filterOptions(options, "lov").map((option) => option.value)).toEqual(["ada"]);
    expect(filterOptions(options, "ALAN").map((option) => option.value)).toEqual(["alan"]);
  });

  it("returns every option for an empty query", () => {
    expect(filterOptions(options, "  ")).toHaveLength(options.length);
  });
});

describe("labelFor / labelsFor", () => {
  it("maps values to labels and falls back to the raw value", () => {
    expect(labelFor(options, "ada")).toBe("Ada Lovelace");
    expect(labelFor(options, "custom")).toBe("custom");
    expect(labelFor(options, null)).toBeNull();
    expect(labelsFor(options, ["ada", "custom"])).toEqual(["Ada Lovelace", "custom"]);
  });
});

describe("findExact", () => {
  it("finds an option by label or value but ignores disabled ones", () => {
    expect(findExact(options, "ada")?.value).toBe("ada");
    expect(findExact(options, "Ada Lovelace")?.value).toBe("ada");
    expect(findExact(options, "Grace Hopper")).toBeNull();
    expect(findExact(options, "   ")).toBeNull();
  });
});

describe("toOption", () => {
  it("turns free input into an option, trimmed", () => {
    expect(toOption("  new-value ")).toEqual({ value: "new-value", label: "new-value" });
  });
});
