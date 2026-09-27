import type { PushToken } from "./types";

export type PushTokenRegistrar = {
  register: (token: PushToken) => Promise<void>;
  revoke?: (token: PushToken) => Promise<void>;
};

export type PushTokenManagerOptions = {
  getToken: () => Promise<PushToken | null>;
  registrar: PushTokenRegistrar;
};

export type PushTokenManager = {
  register: () => Promise<PushToken | null>;
  revoke: () => Promise<void>;
};

// Fetches the device token and syncs it with the backend; no-op when no token is available.
export function createPushTokenManager({ getToken, registrar }: PushTokenManagerOptions): PushTokenManager {
  return {
    async register() {
      const token = await getToken();
      if (!token) return null;
      await registrar.register(token);
      return token;
    },
    async revoke() {
      const token = await getToken();
      if (token) await registrar.revoke?.(token);
    },
  };
}
