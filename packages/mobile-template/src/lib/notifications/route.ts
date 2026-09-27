import type { NotificationPayload } from "./types";

export type NotificationRouteMap = Partial<Record<string, (id: string) => string | null>>;

export type NotificationRouter = { resolve: (payload: NotificationPayload) => string | null };

export function notificationPath(payload: NotificationPayload, routes: NotificationRouteMap): string | null {
  const mapper = routes[payload.type];
  return mapper ? mapper(payload.id) : null;
}

// Allowlists event types: only explicitly mapped types resolve to a route.
export function createNotificationRouter(routes: NotificationRouteMap): NotificationRouter {
  return { resolve: (payload) => notificationPath(payload, routes) };
}
