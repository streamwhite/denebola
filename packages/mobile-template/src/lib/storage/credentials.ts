import type { Storage } from "./types";

export type StoredCredential = { username: string; password: string };

export const CREDENTIALS_KEY = "auth.credentials";

// Credential storage is separate from the session so "remember me" can be cleared independently.
// Pass a rotating, biometric-gated Storage implementation for production use.
export function createCredentialStore(storage: Storage) {
  return {
    async save(credential: StoredCredential): Promise<void> {
      await storage.set(CREDENTIALS_KEY, credential);
    },
    load(): Promise<StoredCredential | null> {
      return storage.get<StoredCredential>(CREDENTIALS_KEY);
    },
    clear(): Promise<void> {
      return storage.remove(CREDENTIALS_KEY);
    },
    has(): Promise<boolean> {
      return storage.get<StoredCredential>(CREDENTIALS_KEY).then((value) => value !== null);
    },
  };
}

export type CredentialStore = ReturnType<typeof createCredentialStore>;
