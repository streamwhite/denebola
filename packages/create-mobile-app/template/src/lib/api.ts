import { createApiClient, createSessionManager, secureStorage } from "{{packageName}}";

const FALLBACK_BASE_URL = "";
const session = createSessionManager(secureStorage);

export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_BASE_URL,
  getToken: async () => (await session.restore())?.accessToken ?? null,
  // Exchange the stored refresh token for a fresh access token on 401.
  refreshToken: async () => {
    const current = await session.restore();
    if (!current?.refreshToken) return null;
    const next = await api.request<typeof current>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: current.refreshToken }), skipAuth: true });
    await session.save(next);
    return next.accessToken;
  },
});
