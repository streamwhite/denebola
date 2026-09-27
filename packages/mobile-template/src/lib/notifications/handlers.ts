import type { NotificationAdapter } from "./adapter";
import type { NotificationPayload } from "./types";

export type NotificationHandlers = {
  onForeground?: (payload: NotificationPayload) => void;
  onBackground?: (payload: NotificationPayload, coldStart: boolean) => void;
};

export function subscribeToNotifications(adapter: NotificationAdapter, handlers: NotificationHandlers): () => void {
  return adapter.subscribe((payload, source) => {
    if (source === "foreground") handlers.onForeground?.(payload);
    else handlers.onBackground?.(payload, false);
  });
}

// Handles the notification that launched the app (cold start) exactly once.
export async function consumeInitialNotification(adapter: NotificationAdapter, handlers: NotificationHandlers): Promise<NotificationPayload | null> {
  const payload = await adapter.getInitialPayload();
  if (payload) handlers.onBackground?.(payload, true);
  return payload;
}
