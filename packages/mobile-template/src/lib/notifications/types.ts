export type NotificationPayload = { type: string; id: string };

export type NotificationSource = "foreground" | "background";

export type PushTokenPlatform = "ios" | "android" | "web" | "unknown";

export type PushToken = { token: string; platform: PushTokenPlatform; updatedAt: number };

export type NotificationTrigger = { date: Date } | { seconds: number };

export type LocalNotification = {
  title: string;
  body?: string;
  data?: NotificationPayload;
  trigger?: NotificationTrigger;
};

export function parseNotificationPayload(value: unknown): NotificationPayload | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return typeof data.type === "string" && typeof data.id === "string" ? { type: data.type, id: data.id } : null;
}

export function toPushToken(token: string, platform: PushTokenPlatform = "unknown", now = Date.now()): PushToken {
  return { token, platform, updatedAt: now };
}
