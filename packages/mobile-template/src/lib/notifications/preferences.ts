import { createMemoryStorage } from "../storage/memoryStorage";
import { createPreferences, type PreferenceValues, type Preferences } from "../storage/preferences";
import type { Storage } from "../storage/types";

export type NotificationPreferences = PreferenceValues & {
  enabled: boolean;
  types: Record<string, boolean>;
};

export const NOTIFICATION_PREFERENCES_KEY = "app.notificationPreferences";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = { enabled: true, types: {} };

export function createNotificationPreferences(storage?: Storage): Preferences<NotificationPreferences> {
  return createPreferences<NotificationPreferences>({
    storage: storage ?? createMemoryStorage(),
    key: NOTIFICATION_PREFERENCES_KEY,
    defaults: DEFAULT_NOTIFICATION_PREFERENCES,
  });
}

// A type is on when the master switch is on and the type is not explicitly disabled.
export function isNotificationTypeEnabled(preferences: NotificationPreferences, type: string): boolean {
  return preferences.enabled && (preferences.types[type] ?? true);
}
