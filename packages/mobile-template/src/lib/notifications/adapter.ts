import type { PermissionStatus } from "../permissions/permission";
import type { LocalNotification, NotificationPayload, NotificationSource, PushToken } from "./types";

// Single contract the app implements over expo-notifications (or any push provider). Keeping it
// injected means the framework carries no native notification dependency by default.
export type NotificationAdapter = {
  requestPermission: () => Promise<PermissionStatus>;
  getToken: () => Promise<PushToken | null>;
  schedule: (notification: LocalNotification) => Promise<string>;
  cancel: (id: string) => Promise<void>;
  getInitialPayload: () => Promise<NotificationPayload | null>;
  subscribe: (listener: (payload: NotificationPayload, source: NotificationSource) => void) => () => void;
};
