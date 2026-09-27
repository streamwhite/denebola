import { describe, expect, it } from "vitest";
import { appMessages } from "../src/messages";

const SIMPLE_PLACEHOLDER = /\{\s*([A-Za-z_$][\w$]*)\s*\}/g;
const placeholders = (message: string) => [...message.matchAll(SIMPLE_PLACEHOLDER)].map((match) => match[1]).sort();

const catalogs: Record<string, string>[] = Object.values(appMessages);

describe("app translations", () => {
  it("define the same keys and placeholders for every locale", () => {
    const [reference, ...rest] = catalogs;

    for (const locale of rest) {
      expect(Object.keys(locale).sort()).toEqual(Object.keys(reference).sort());
      for (const key of Object.keys(reference)) expect(placeholders(locale[key])).toEqual(placeholders(reference[key]));
    }
  });
});
