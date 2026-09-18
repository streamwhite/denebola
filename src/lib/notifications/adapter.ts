import type { NotificationPayload } from "@/lib/notifications/types";

export type NotificationAdapter = { requestPermission: () => Promise<boolean>; getToken: () => Promise<string | null>; schedule: (payload: NotificationPayload, date: Date) => Promise<string> };
