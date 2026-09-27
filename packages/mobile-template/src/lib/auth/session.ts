import type { Storage } from "../storage/types";
import type { Session } from "./types";

export const SESSION_KEY = "auth.session";

export function isSessionExpired(session: Session | null, now = Date.now()): boolean {
  if (!session) return true;
  return session.expiresAt !== undefined && session.expiresAt <= now;
}

export function createSessionManager(storage: Storage) {
  return {
    save: (session: Session) => storage.set(SESSION_KEY, session),
    restore: () => storage.get<Session>(SESSION_KEY),
    clear: () => storage.remove(SESSION_KEY),
  };
}

export type SessionManager = ReturnType<typeof createSessionManager>;
