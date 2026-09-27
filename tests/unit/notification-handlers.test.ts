import { describe, expect, it, vi } from "vitest";
import type { NotificationAdapter } from "@/lib/notifications/adapter";
import { consumeInitialNotification, subscribeToNotifications } from "@/lib/notifications/handlers";
import type { NotificationPayload, NotificationSource } from "@/lib/notifications/types";

type Listener = (payload: NotificationPayload, source: NotificationSource) => void;

function createFakeAdapter(initial: NotificationPayload | null = null) {
  const subscription: { listener?: Listener } = {};
  const adapter: NotificationAdapter = {
    async requestPermission() {
      return "granted";
    },
    async getToken() {
      return null;
    },
    async schedule() {
      return "id";
    },
    async cancel() {},
    async getInitialPayload() {
      return initial;
    },
    subscribe(listener) {
      subscription.listener = listener;
      return () => {
        subscription.listener = undefined;
      };
    },
  };
  return {
    adapter,
    emit: (payload: NotificationPayload, source: NotificationSource) => subscription.listener?.(payload, source),
    hasListener: () => subscription.listener !== undefined,
  };
}

describe("subscribeToNotifications", () => {
  it("routes foreground and background events to their handlers", () => {
    const fake = createFakeAdapter();
    const onForeground = vi.fn();
    const onBackground = vi.fn();

    const unsubscribe = subscribeToNotifications(fake.adapter, { onForeground, onBackground });
    fake.emit({ type: "message", id: "1" }, "foreground");
    fake.emit({ type: "message", id: "2" }, "background");

    expect(onForeground).toHaveBeenCalledWith({ type: "message", id: "1" });
    expect(onBackground).toHaveBeenCalledWith({ type: "message", id: "2" }, false);

    unsubscribe();
    expect(fake.hasListener()).toBe(false);
  });
});

describe("consumeInitialNotification", () => {
  it("reports the launching notification as a cold start", async () => {
    const fake = createFakeAdapter({ type: "profile", id: "9" });
    const onBackground = vi.fn();

    expect(await consumeInitialNotification(fake.adapter, { onBackground })).toEqual({ type: "profile", id: "9" });
    expect(onBackground).toHaveBeenCalledWith({ type: "profile", id: "9" }, true);
  });

  it("returns null when there is no launching notification", async () => {
    const fake = createFakeAdapter();
    expect(await consumeInitialNotification(fake.adapter, {})).toBeNull();
  });
});
