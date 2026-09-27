import { describe, expect, it } from "vitest";
import { parseNotificationPayload, toPushToken } from "@/lib/notifications/types";

describe("parseNotificationPayload", () => {
  it("accepts only payloads with a string type and id", () => {
    expect(parseNotificationPayload({ type: "message", id: "1" })).toEqual({ type: "message", id: "1" });
    expect(parseNotificationPayload({ type: "message" })).toBeNull();
    expect(parseNotificationPayload("nope")).toBeNull();
  });
});

describe("toPushToken", () => {
  it("stamps the token with platform and time", () => {
    expect(toPushToken("abc", "ios", 100)).toEqual({ token: "abc", platform: "ios", updatedAt: 100 });
  });
});
