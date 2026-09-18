import { describe, expect, it } from "vitest";
import { parseDeepLink } from "@/lib/deeplink/parseDeepLink";

describe("parseDeepLink", () => {
  it("accepts only known app routes", () => {
    expect(parseDeepLink("myapp://profile/42")).toEqual({ pathname: "/profile/42" });
    expect(parseDeepLink("javascript:alert(1)")).toBeNull();
    expect(parseDeepLink("myapp://unknown/42")).toBeNull();
  });
});
