import { buildDeepLink } from "../navigation/navigationCore";
import { notificationPath, type NotificationRouteMap } from "./route";
import type { NotificationPayload } from "./types";

export type NotificationDeepLinkOptions = {
  routes: NotificationRouteMap;
  scheme: string;
};

// Converts a validated payload into an app deep link. Unknown types return null so arbitrary
// payloads cannot navigate.
export function notificationDeepLink(payload: NotificationPayload, { routes, scheme }: NotificationDeepLinkOptions): string | null {
  const path = notificationPath(payload, routes);
  return path ? buildDeepLink(scheme, path) : null;
}
