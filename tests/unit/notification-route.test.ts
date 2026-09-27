import { describe, expect, it } from "vitest";
import { notificationPath } from "@/lib/notifications/route";

const routes = { profile: (id: string) => `/profile/${id}` };

describe("notificationPath", () => {
  it("maps validated events to explicit routes", () => {
    expect(notificationPath({ type: "profile", id: "42" }, routes)).toBe("/profile/42");
    expect(notificationPath({ type: "message", id: "42" }, routes)).toBeNull();
  });
});
