# Auth Example

Authentication stays a business concern. The runtime provides the state container and the storage contract:

- `AuthProvider` + `useAuth()` hold the session (`status`, `session`, `login`, `logout`) and require an application-provided `AuthClient`.
- `createSessionManager(storage)` persists that session — `secureStorage` on device, `createMemoryStorage()` in tests.
- `createApiClient({ baseUrl, getToken })` attaches the bearer token and normalizes failures into `ApiError`.

```tsx
// src/app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider, MobileTemplateProvider } from "@your-scope/mobile-template";
import { authClient } from "../../features/auth/client";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <AuthProvider client={authClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </MobileTemplateProvider>
  );
}
```

```tsx
// src/features/auth/client.ts — inject your backend, the runtime couples to no vendor
import { createApiClient, createSessionManager, secureStorage } from "@your-scope/mobile-template";
import type { AuthClient, Session } from "@your-scope/mobile-template";

const sessions = createSessionManager(secureStorage);
const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => (await sessions.restore())?.accessToken ?? null,
});

export const authClient: AuthClient = {
  login: (email, password) => api.request<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api.request<void>("/auth/logout", { method: "POST" }),
  restore: () => sessions.restore(),
};
```

Guard protected routes by reading `useAuth().status` in a route-group layout, and validate credentials with a business schema (`zod` is already available in the generated project). Note that `secureStorage.clear()` intentionally throws: clear sessions through `createSessionManager(...).clear()` instead of a global wipe.

