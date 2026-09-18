import type { NotificationPayload } from "@/lib/notifications/types";

export function notificationPath(payload: NotificationPayload): string | null { return payload.type === "profile" ? `/profile/${encodeURIComponent(payload.id)}` : null; }
