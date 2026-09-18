import type { Session } from "@/lib/auth/types";
import type { Storage } from "@/lib/storage/types";

const SESSION_KEY = "auth.session";

export function createSessionManager(storage: Storage) {
  return {
    save: (session: Session) => storage.set(SESSION_KEY, session),
    restore: () => storage.get<Session>(SESSION_KEY),
    clear: () => storage.remove(SESSION_KEY),
  };
}
