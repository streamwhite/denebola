import { describe, expect, it } from "vitest";
import { notificationDeepLink } from "@/lib/notifications/deeplink";
import { createNotificationRouter } from "@/lib/notifications/route";

const routes = { profile: (id: string) => `/profile/${id}` };

describe("notificationDeepLink", () => {
  it("builds a deep link for known types only", () => {
    expect(notificationDeepLink({ type: "profile", id: "42" }, { routes, scheme: "myapp" })).toBe("myapp://profile/42");
    expect(notificationDeepLink({ type: "message", id: "42" }, { routes, scheme: "myapp" })).toBeNull();
  });
});

describe("createNotificationRouter", () => {
  it("resolves known types and rejects unknown ones", () => {
    const router = createNotificationRouter(routes);

    expect(router.resolve({ type: "profile", id: "1" })).toBe("/profile/1");
    expect(router.resolve({ type: "other", id: "1" })).toBeNull();
  });
});
