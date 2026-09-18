import { describe, expect, it } from "vitest";
import { notificationPath } from "@/lib/notifications/route";

describe("notificationPath", () => {
  it("maps validated events to explicit routes", () => {
    expect(notificationPath({ type: "profile", id: "42" })).toBe("/profile/42");
    expect(notificationPath({ type: "message", id: "42" })).toBeNull();
  });
});
