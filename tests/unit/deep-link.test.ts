import { describe, expect, it } from "vitest";
import { parseDeepLink } from "@/lib/deeplink/parseDeepLink";

const config = { scheme: "myapp", allowedPaths: [/^\/profile\/[^/]+$/, /^\/home$/] };

describe("parseDeepLink", () => {
  it("accepts only known app routes for the configured scheme", () => {
    expect(parseDeepLink("myapp://profile/42", config)).toEqual({ pathname: "/profile/42" });
    expect(parseDeepLink("javascript:alert(1)", config)).toBeNull();
    expect(parseDeepLink("myapp://unknown/42", config)).toBeNull();
    expect(parseDeepLink("other://profile/42", config)).toBeNull();
  });
});
