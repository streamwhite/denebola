import { describe, expect, it } from "vitest";
import { capitalize, isNonEmpty, slugify, titleCase, truncate } from "@/lib/utils/string";
import { hasMaxLength, hasMinLength, isEmail, isNumeric, isPhoneNumber, isUrl } from "@/lib/utils/validation";

describe("string utilities", () => {
  it("capitalizes, titles and slugifies", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(titleCase("hello world")).toBe("Hello World");
    expect(slugify("Héllo World! 42")).toBe("hello-world-42");
  });

  it("truncates with a suffix", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
    expect(truncate("ab", 4)).toBe("ab");
  });

  it("detects non-empty strings", () => {
    expect(isNonEmpty(" x ")).toBe(true);
    expect(isNonEmpty("   ")).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
  });
});

describe("validation utilities", () => {
  it("validates emails, urls and phones", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("nope")).toBe(false);
    expect(isUrl("https://example.com")).toBe(true);
    expect(isUrl("ftp://example.com")).toBe(false);
    expect(isPhoneNumber("+1 (555) 123-4567")).toBe(true);
    expect(isPhoneNumber("abc")).toBe(false);
  });

  it("validates numeric and length constraints", () => {
    expect(isNumeric("12.5")).toBe(true);
    expect(isNumeric("x")).toBe(false);
    expect(hasMinLength("abc", 3)).toBe(true);
    expect(hasMaxLength("abc", 2)).toBe(false);
  });
});
